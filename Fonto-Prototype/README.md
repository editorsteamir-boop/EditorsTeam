# Fonto Prototype v0.1

Prototype structure for the Fonto editor.

## Current modules
- Canvas Editor
- PNG Text Box Manager
- Font Controls
- Project Draft Save
- Export Pipeline

## Backend migration plan
Local storage -> Supabase

Supabase modules:
- Authentication
- Storage
- Database

Heavy assets (fonts, transparent PNG text boxes, backgrounds and previews) will live in Supabase Storage to keep GitHub lightweight and improve loading speed.
