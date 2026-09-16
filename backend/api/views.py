from django.http import HttpResponse, JsonResponse


def home(_request):
    return HttpResponse(
        """
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>FreshTrack backend</title>
            <style>
              body { font-family: system-ui, sans-serif; margin: 2rem; color: #111; background: #fff; }
              a { color: #0b57d0; }
            </style>
          </head>
          <body>
            <h1>FreshTrack backend is running</h1>
            <p>This is the Django server. Useful URLs:</p>
            <ul>
              <li><a href="/api/health/">/api/health/</a> — JSON health check</li>
              <li><a href="/admin/">/admin/</a> — Django admin</li>
            </ul>
          </body>
        </html>
        """,
        content_type="text/html",
    )


def health(_request):
    return JsonResponse({"status": "ok", "service": "freshtrack-backend"})

