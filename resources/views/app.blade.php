<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Memoria Photobooth</title>
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    <link href="https://fonts.googleapis.com/css2?family=Libre+Bodoni:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
</head>
<body>
    <div id="app"></div>
    <script>
        window.MIDTRANS_CLIENT_KEY = "{{ config('services.midtrans.client_key') }}";
    </script>
</body>
</html>