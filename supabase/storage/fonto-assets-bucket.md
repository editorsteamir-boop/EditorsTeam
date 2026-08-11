# Fonto Assets Storage

Bucket: `fonto-assets`

Folders:

```
fonto-assets/
├── text-boxes/
└── styles/
```

Import flow:

ZIP Asset
-> Extract
-> Upload to Storage
-> Save public URL
-> Insert into fonto_text_boxes / fonto_styles

Next step: connect FontoImportPage to Supabase Storage.
