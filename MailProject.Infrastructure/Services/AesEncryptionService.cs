using System.Security.Cryptography;
using System.Text;
using MailProject.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;

namespace MailProject.Infrastructure.Services
{
    public class AesEncryptionService : IEncryptionService
    {
        private readonly byte[] _key;
        private readonly byte[] _iv;

        public AesEncryptionService(IConfiguration configuration)
        {
            var keyString = configuration["Encryption:Key"];
            var ivString = configuration["Encryption:IV"];

            if (string.IsNullOrEmpty(keyString) || string.IsNullOrEmpty(ivString))
            {
                // Fallback for development/demo if not set, but ideally throw
                // Using a static default for demo purposes only:
                _key = Encoding.UTF8.GetBytes("12345678901234567890123456789012"); // 32 bytes
                _iv = Encoding.UTF8.GetBytes("1234567890123456"); // 16 bytes
            }
            else
            {
                 _key = Convert.FromBase64String(keyString);
                 _iv = Convert.FromBase64String(ivString);
            }
        }

        public string Encrypt(string plainText)
        {
            using (var aes = Aes.Create())
            {
                aes.Key = _key;
                aes.IV = _iv;

                var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);

                using (var ms = new MemoryStream())
                {
                    using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
                    {
                        using (var sw = new StreamWriter(cs))
                        {
                            sw.Write(plainText);
                        }
                    }
                    return Convert.ToBase64String(ms.ToArray());
                }
            }
        }

        public string Decrypt(string cipherText)
        {
            using (var aes = Aes.Create())
            {
                aes.Key = _key;
                aes.IV = _iv;

                var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);

                using (var ms = new MemoryStream(Convert.FromBase64String(cipherText)))
                {
                    using (var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read))
                    {
                        using (var sr = new StreamReader(cs))
                        {
                            return sr.ReadToEnd();
                        }
                    }
                }
            }
        }
    }
}
