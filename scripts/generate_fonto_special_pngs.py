#!/usr/bin/env python3
"""Generate the transparent gradient PNG boxes used by Fonto quick styles.

Requires Pillow. The source of truth for colors, names, and fade directions is
scripts/fonto-special-styles.json so the database catalog and pixels stay aligned.
"""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path

from PIL import Image, ImageChops, ImageColor, ImageDraw, ImageFilter


WIDTH = 900
HEIGHT = 320


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--config",
        type=Path,
        default=Path(__file__).with_name("fonto-special-styles.json"),
    )
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--contact-sheet", type=Path)
    return parser.parse_args()


def mix(left: tuple[int, int, int], right: tuple[int, int, int], amount: float) -> tuple[int, int, int]:
    return tuple(round(a + (b - a) * amount) for a, b in zip(left, right))


def horizontal_gradient(colors: list[str]) -> Image.Image:
    rgb = [ImageColor.getrgb(color) for color in colors]
    row = Image.new("RGB", (WIDTH, 1))
    pixels = row.load()
    segments = max(1, len(rgb) - 1)
    for x in range(WIDTH):
        progress = x / max(1, WIDTH - 1)
        position = progress * segments
        index = min(segments - 1, int(position))
        pixels[x, 0] = mix(rgb[index], rgb[index + 1], position - index)
    return row.resize((WIDTH, HEIGHT), Image.Resampling.BILINEAR).convert("RGBA")


def fade_mask(direction: str) -> Image.Image:
    mask = Image.new("L", (WIDTH, HEIGHT), 0)
    pixels = mask.load()
    for x in range(WIDTH):
        if direction == "left":
            alpha = min(1.0, x / (WIDTH * 0.38))
        elif direction == "right":
            alpha = min(1.0, (WIDTH - 1 - x) / (WIDTH * 0.38))
        else:
            alpha = min(1.0, x / (WIDTH * 0.27), (WIDTH - 1 - x) / (WIDTH * 0.27))
        alpha = alpha * alpha * (3 - 2 * alpha)
        value = round(255 * alpha)
        for y in range(HEIGHT):
            pixels[x, y] = value
    return mask


def shape_mask(shape: str) -> Image.Image:
    mask = Image.new("L", (WIDTH, HEIGHT), 0)
    draw = ImageDraw.Draw(mask)
    if shape == "ribbon":
        draw.polygon(
            [(28, 76), (802, 76), (886, 160), (802, 244), (28, 244), (92, 160)],
            fill=246,
        )
    elif shape == "glass":
        draw.rounded_rectangle((28, 70, 872, 250), radius=78, fill=226)
    else:
        draw.rounded_rectangle((28, 66, 872, 254), radius=94, fill=248)
    return mask


def masked_overlay(overlay: Image.Image, alpha: Image.Image) -> Image.Image:
    result = overlay.copy()
    result.putalpha(ImageChops.multiply(result.getchannel("A"), alpha))
    return result


def render_asset(palette: dict, variant: dict, index: int) -> Image.Image:
    direction = variant["fade"]
    shape = variant["shape"]
    fade = fade_mask(direction)
    silhouette = shape_mask(shape)
    alpha = ImageChops.multiply(fade, silhouette)

    base = horizontal_gradient(palette["colors"])
    base.putalpha(alpha)

    canvas = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    glow_color = ImageColor.getrgb(palette["colors"][len(palette["colors"]) // 2])
    glow_alpha = alpha.filter(ImageFilter.GaussianBlur(24)).point(lambda value: round(value * 0.34))
    glow = Image.new("RGBA", (WIDTH, HEIGHT), (*glow_color, 0))
    glow.putalpha(ImageChops.multiply(glow_alpha, fade))
    canvas = Image.alpha_composite(canvas, glow)
    canvas = Image.alpha_composite(canvas, base)

    accents = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(accents)
    draw.rounded_rectangle((56, 86, 844, 234), radius=70, outline=(255, 255, 255, 76), width=3)
    draw.line((120, 104, 780, 104), fill=(255, 255, 255, 64), width=3)
    if shape == "ribbon":
        draw.polygon([(94, 160), (136, 118), (136, 202)], fill=(255, 255, 255, 34))
    elif shape == "glass":
        for offset in range(3):
            x = 420 + offset * 30
            draw.ellipse((x, 222, x + 8, 230), fill=(255, 255, 255, 70 - offset * 14))
    else:
        opaque_x = 804 if direction == "left" else 84
        draw.rounded_rectangle((opaque_x - 5, 108, opaque_x + 5, 212), radius=5, fill=(255, 255, 255, 88))
    canvas = Image.alpha_composite(canvas, masked_overlay(accents, alpha))

    sheen = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    sheen_draw = ImageDraw.Draw(sheen)
    phase = (index % 5) * 18
    sheen_draw.polygon(
        [(210 + phase, 68), (330 + phase, 68), (520 + phase, 252), (400 + phase, 252)],
        fill=(255, 255, 255, 24),
    )
    canvas = Image.alpha_composite(canvas, masked_overlay(sheen, alpha))

    final_alpha = ImageChops.multiply(canvas.getchannel("A"), fade)
    canvas.putalpha(final_alpha)
    return canvas


def make_contact_sheet(files: list[Path], destination: Path) -> None:
    tile_width = 300
    tile_height = 126
    columns = 3
    rows = math.ceil(len(files) / columns)
    sheet = Image.new("RGB", (columns * tile_width, rows * tile_height), "#071126")
    for index, file in enumerate(files):
        preview = Image.open(file).convert("RGBA")
        preview.thumbnail((tile_width - 12, tile_height - 12), Image.Resampling.LANCZOS)
        x = (index % columns) * tile_width + (tile_width - preview.width) // 2
        y = (index // columns) * tile_height + (tile_height - preview.height) // 2
        sheet.paste(preview, (x, y), preview)
    destination.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(destination, "PNG", optimize=True)


def main() -> None:
    args = parse_args()
    config = json.loads(args.config.read_text(encoding="utf-8"))
    args.output_dir.mkdir(parents=True, exist_ok=True)
    files: list[Path] = []
    index = 0
    for palette in config["palettes"]:
        for variant in config["variants"]:
            index += 1
            filename = f"special-{index:02d}-{palette['key']}-{variant['key']}.png"
            destination = args.output_dir / filename
            render_asset(palette, variant, index).save(destination, "PNG", optimize=True)
            files.append(destination)
    if len(files) != 30:
        raise RuntimeError(f"Expected 30 PNGs, generated {len(files)}")
    if args.contact_sheet:
        make_contact_sheet(files, args.contact_sheet)
    print(f"Generated {len(files)} transparent PNG files in {args.output_dir}")


if __name__ == "__main__":
    main()
