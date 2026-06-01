Feel Free Spa - Netlify 3-minute private gallery

How it works:
1. Open /admin after deploying.
2. Enter admin PIN, customer name, and customer WhatsApp number.
3. Copy the generated customer link.
4. Send that link on WhatsApp.
5. The link expires after 3 minutes.

Netlify setup:
1. Upload/deploy this whole folder to Netlify.
2. In Netlify, go to Site configuration > Environment variables.
3. Add ADMIN_PIN with your private admin PIN.
4. Add LINK_SECRET with any long random text.
5. Edit public/gallery.html and change SPA_WHATSAPP_NUMBER from 919840012345 to your real WhatsApp number.
6. Add your images to public/images using the filenames listed in public/images/README.txt.

Important:
This blocks expired links at the server function level, but no website can fully stop screenshots once a customer can see the image. Use strong watermarking and low-resolution photos.
