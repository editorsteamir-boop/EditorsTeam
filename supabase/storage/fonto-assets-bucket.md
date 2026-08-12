# Fonto Text Style Preview Storage

Bucket: `fonto-text-boxes`

Folders:

```
fonto-text-boxes/
└── library-v1-a7f4c9b1e2d3/
    └── <style-preview>.png
```

Import flow:

Fonto APK style preview
-> Extract
-> Upload to Storage
-> Save public URL
-> Insert quick PNG metadata into fonto_quick_styles
-> Insert bilingual text effects into fonto_text_themes (no preview image required)

Next step: connect FontoImportPage to Supabase Storage.
