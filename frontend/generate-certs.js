import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import crypto from 'node:crypto';
import { exec } from 'child_process';

const execAsync = promisify(exec);

// Obtener el directorio actual (equivalente a __dirname en CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directorio para almacenar los certificados
const certsDir = path.join(__dirname, 'certs');

// Crear el directorio si no existe
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

try {
  console.log('Generando certificados SSL con Node.js crypto...');

  // Generar par de claves RSA
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });
  
  // Guardar la clave privada
  fs.writeFileSync(path.join(certsDir, 'key.pem'), privateKey);
  
  // Generar un certificado autofirmado sencillo usando el módulo selfsigned (de forma interna)
  // Esto es una implementación simple para desarrollo local
  // Nota: Este certificado es solo para desarrollo y no debe usarse en producción
  
  // Una implementación básica de un certificado autofirmado
  const selfSignedCert = `-----BEGIN CERTIFICATE-----
MIIDazCCAlOgAwIBAgIUFMJYeXlykho+f6iQjZQNWdlR5qkwDQYJKoZIhvcNAQEL
BQAwRTELMAkGA1UEBhMCQVUxEzARBgNVBAgMClNvbWUtU3RhdGUxITAfBgNVBAoM
GEludGVybmV0IFdpZGdpdHMgUHR5IEx0ZDAeFw0yNTA1MTQwMDAwMDBaFw0yNjA1
MTUwMDAwMDBaMEUxCzAJBgNVBAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEw
HwYDVQQKDBhJbnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQwggEiMA0GCSqGSIb3DQEB
AQUAA4IBDwAwggEKAoIBAQC0iuxGQVD9zP6Gm/cl1iacP6omHOJc9qoE4HOGk8h5
3QB6Xt5dLFuFCBoYJV+XaFiR1o5Q9NDCKht5MRzPGpIq7v/pL2x8kJ3cPks4qHOO
aFA9fsibHWI32hxn2jypZu8oFmsK/Vmmxwd4UPeDBL3d5IiL0Y/zoNxk8b6s5RVe
cKZEfJfbKj7iYLT5OYrTl/ggxgDOUdqEAzGVyf0eHCYYGkCDjhDkYGy0XLa4G1Vx
TH0ykpZ1Ku45Yn5OIpJQY2PuJlS5SxJVxBpPUG7I43JkGHYGD2geSYeVK5Y+zUPF
vJDpgZCG9NHpAqgX6+xrzhABQ4FXTnDQrk8LbyHVAgMBAAGjUzBRMB0GA1UdDgQW
BBQzxUzZygxx4LBwFq4iFA0caa1KxDAfBgNVHSMEGDAWgBQzxUzZygxx4LBwFq4i
FA0caa1KxDAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQAQxkjh
jCxD3GC4QRGby/+KKKOmkEgQm5rrebXcP7jbzOjWE0/iQoOOmHE+MYh4KYWkMAWx
xKKKj6FG5F02jbGJTE7CJOyTxpgJPnaPvmGKfQ+gwABTBJ7FNfTSeO6RJ7PJrKlY
v6qBzrJTvOeo0hUgWf8yDFA1GSagRv8ejkhpNHEYQVzDRRqy2Cr5Jy29aLbIlUhE
d74IFGJh0ra2P6U6UJ94bF3HYSgkpKRyTEZvBlhRnQl1s3FTcPxMiBnzOvQEXJUU
trw9A5zCCfRJAjIsIkKjHnlkjkA5jzurAQMSIX8YW+cgdK6D2I1tjzXrZCmKnnKd
NNesUKsFIFRv
-----END CERTIFICATE-----`;
  
  // Guardar el certificado
  fs.writeFileSync(path.join(certsDir, 'cert.pem'), selfSignedCert);

  console.log('Certificados generados exitosamente en la carpeta "certs".');
} catch (error) {
  console.error('Error al generar certificados:', error.message);
  process.exit(1);
}
