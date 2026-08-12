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
-> Insert effect settings into fonto_styles

Next step: connect FontoImportPage to Supabase Storage.
