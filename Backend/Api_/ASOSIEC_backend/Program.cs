using ASOSIEC.Services;
using ASOSIEC_backend.Configuration;
using ASOSIEC_backend.Services;
using DataAccess;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Negocio;
using Negocio.Services;
using System.Text;

using static System.Net.WebRequestMethods;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddScoped<ConfiguracionService>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<RideService>();
builder.Services.AddScoped<negocio>();

DataAcces.ConfigurarConexion(builder.Configuration);

var corsOrigins = builder.Configuration.GetValue<string>("App:CorsOrigins");

// ============================================
// CONFIGURACIÓN DE JWT AUTHENTICATION
// ============================================
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

if (string.IsNullOrEmpty(jwtKey))
{
    throw new InvalidOperationException("❌ JWT Key no está configurada en appsettings.json");
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero
    };

    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine($"🔴 Authentication failed: {context.Exception.Message}");
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            Console.WriteLine($"✅ Token validado para: {context.Principal?.Identity?.Name}");
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("VendedorOnly", policy => policy.RequireRole("Vendedor"));
    options.AddPolicy("ClienteOnly", policy => policy.RequireRole("Cliente"));
    options.AddPolicy("AdminOrVendedor", policy => policy.RequireRole("Admin", "Vendedor"));
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
        options.JsonSerializerOptions.WriteIndented = true;
    });

builder.Services.AddScoped<negocio>();
// ✅ Registrar Cloudinary
builder.Services.Configure<CloudinarySettings>(
builder.Configuration.GetSection("Cloudinary"));
builder.Services.AddScoped<CloudinaryService>();

builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<ReCaptchaService>();

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<AuditService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        policy =>
        {
            policy.WithOrigins(corsOrigins ?? "http://localhost:4200")
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        });
});

builder.Services.AddEndpointsApiExplorer();

// ============================================
// ✅ SWAGGER CON SOPORTE PARA JWT
// ============================================
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ASOSIEC API",
        Version = "v1",
        Description = "API de gestión de ventas en línea"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Ingresa el token JWT. Ejemplo: 'Bearer {tu_token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// ============================================
// ⚠️ SWAGGER SIEMPRE DISPONIBLE EN DESARROLLO
// ============================================
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "ASOSIEC API v1");
});

// ============================================
// ⚠️ HTTPS SOLO EN PRODUCCIÓN
// ============================================
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowAngularApp");
app.UseMiddleware<ASOSIEC_backend.Middleware.RateLimitingMiddleware>();
app.UseMiddleware<ASOSIEC_backend.Middleware.AuditMiddleware>();
app.UseAuthentication();
app.UseAuthorization();

app.Use(async (context, next) =>
{
    await next();
    if (context.Response.ContentType == null || context.Response.ContentType == "text/plain")
    {
        context.Response.ContentType = "application/json";
    }
});

app.MapControllers();

Console.WriteLine("✅ API iniciada con JWT Authentication habilitado");
Console.WriteLine($"✅ CORS permitido desde: {corsOrigins}");
Console.WriteLine($"🔌 Conexión BD configurada desde appsettings.json");
Console.WriteLine($"🌐 Ambiente: {app.Environment.EnvironmentName}");
Console.WriteLine($"📍 URL: http://localhost:5041");
Console.WriteLine($"📚 Swagger: http://localhost:5041/swagger");

// Limpiar caché de rate limiting cada 30 minutos
var cleanupTimer = new System.Threading.Timer(_ =>
{
    ASOSIEC_backend.Middleware.RateLimitingMiddleware.CleanupOldEntries();
    Console.WriteLine("🧹 Caché de rate limiting limpiado");
}, null, TimeSpan.Zero, TimeSpan.FromMinutes(30));
Console.WriteLine("✅ API iniciada con JWT Authentication habilitado");

app.Run();