namespace ASOSIEC_backend.Configuration
{
    public class CloudinarySettings
    {
        public string CloudName { get; set; } = "";
        public string ApiKey { get; set; } = "";
        public string ApiSecret { get; set; } = "";
        public string FolderProductos { get; set; } = "asosiec/productos";
        public string FolderComprobantes { get; set; } = "asosiec/comprobantes";
        public int MaxFileSizeMB { get; set; } = 5;
        public string[] AllowedFormats { get; set; } = { "jpg", "jpeg", "png", "webp", "gif", "pdf" };
    }
}