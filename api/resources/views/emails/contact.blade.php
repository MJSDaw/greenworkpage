<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Nuevo Contacto</title>
</head>
<body>
    <h1>Nuevo Contacto desde la Web</h1>
    
    <p><strong>Nombre de contacto:</strong> {{ $contact->name }}</p>
    <p><strong>Correo de contacto:</strong> {{ $contact->email }}</p>
    
    @if($message)
    <p><strong>Mensaje de contacto:</strong> {{ $message }}</p>
    @endif
    
    <p>Este es un correo automático. Por favor no responda a este mensaje.</p>
    <p>© {{ date('Y') }} Green Work. Todos los derechos reservados.</p>
</body>
</html>
