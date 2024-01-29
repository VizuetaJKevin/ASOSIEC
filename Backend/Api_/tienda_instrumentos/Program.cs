using Negocio;

var builder = WebApplication.CreateBuilder(args);

// Leer la configuración del archivo JSON
var configuration = new ConfigurationBuilder()
    .AddJsonFile("appsettings.json")
    .Build();

builder.Services.AddControllers();

//Aqui Registrar los servicios de Negocio 
builder.Services.AddScoped<negocio>();

// Agregar servicios de Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Valor de CorsOrigins del archivo JSON
var corsOrigins = configuration.GetValue<string>("App:CorsOrigins");

// Agregar configuración CORS
app.UseCors(options =>
{
    options.WithOrigins(corsOrigins)
           .AllowAnyMethod()
           .AllowAnyHeader();
});

app.UseAuthorization();

app.MapControllers();

app.Run();
