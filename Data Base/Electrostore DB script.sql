USE [master]
GO
/****** Object:  Database [Electrostore]    Script Date: 28/01/2024 19:24:09 ******/
CREATE DATABASE [Electrostore]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'Electrostore', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\Electrostore.mdf' , SIZE = 8192KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'Electrostore_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\Electrostore_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO
ALTER DATABASE [Electrostore] SET COMPATIBILITY_LEVEL = 160
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [Electrostore].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [Electrostore] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [Electrostore] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [Electrostore] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [Electrostore] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [Electrostore] SET ARITHABORT OFF 
GO
ALTER DATABASE [Electrostore] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [Electrostore] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [Electrostore] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [Electrostore] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [Electrostore] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [Electrostore] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [Electrostore] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [Electrostore] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [Electrostore] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [Electrostore] SET  ENABLE_BROKER 
GO
ALTER DATABASE [Electrostore] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [Electrostore] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [Electrostore] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [Electrostore] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [Electrostore] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [Electrostore] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [Electrostore] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [Electrostore] SET RECOVERY FULL 
GO
ALTER DATABASE [Electrostore] SET  MULTI_USER 
GO
ALTER DATABASE [Electrostore] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [Electrostore] SET DB_CHAINING OFF 
GO
ALTER DATABASE [Electrostore] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [Electrostore] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [Electrostore] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [Electrostore] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
EXEC sys.sp_db_vardecimal_storage_format N'Electrostore', N'ON'
GO
ALTER DATABASE [Electrostore] SET QUERY_STORE = ON
GO
ALTER DATABASE [Electrostore] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [Electrostore]
GO
/****** Object:  Table [dbo].[categoria_producto]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[categoria_producto](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[estadoId] [int] NULL,
	[nombre_categoria] [varchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[compania]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[compania](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[estadoId] [int] NULL,
	[nombre_compania] [varchar](50) NULL,
	[ruc] [varchar](50) NULL,
	[descripcion] [varchar](50) NULL,
	[razon_Social] [varchar](50) NULL,
	[direccion_Matriz] [varchar](50) NULL,
	[url_img] [varchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[estado]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[estado](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[descripcion] [varchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Items]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Items](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[estadoId] [int] NULL,
	[usuarioId] [int] NULL,
	[productoId] [int] NULL,
	[ordenId] [int] NULL,
	[cantidad] [int] NULL,
	[fecha] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Marca_Producto]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Marca_Producto](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[estadoId] [int] NULL,
	[companiaId] [int] NULL,
	[nombre_marca] [varchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Orden]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Orden](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[estadoId] [int] NULL,
	[usuarioId] [int] NULL,
	[companiaId] [int] NULL,
	[nombre] [varchar](50) NULL,
	[apellido] [varchar](50) NULL,
	[email] [varchar](50) NULL,
	[costo_envio] [decimal](10, 2) NULL,
	[total] [decimal](10, 2) NULL,
	[token_orden] [varchar](50) NULL,
	[direccion_1] [varchar](50) NULL,
	[direccion_2] [varchar](50) NULL,
	[fecha] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[producto]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[producto](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[estadoId] [int] NULL,
	[companiaId] [int] NULL,
	[marca_producto_Id] [int] NULL,
	[categoria_producto_Id] [int] NULL,
	[nombre_producto] [varchar](50) NULL,
	[descripcion] [varchar](500) NULL,
	[stock] [int] NULL,
	[estrellas] [int] NULL,
	[url_Img] [varchar](50) NULL,
	[precio_ahora] [decimal](10, 2) NULL,
	[precio_antes] [decimal](10, 2) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[rol]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[rol](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[descripcion] [varchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[usuario]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[usuario](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[estadoId] [int] NULL,
	[companiaId] [int] NULL,
	[rolId] [int] NULL,
	[nombre] [varchar](50) NULL,
	[apellido] [varchar](50) NULL,
	[email] [varchar](50) NULL,
	[password] [varchar](50) NULL,
	[maxintentos] [int] NULL,
	[intentosfallidos] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET IDENTITY_INSERT [dbo].[categoria_producto] ON 
GO
INSERT [dbo].[categoria_producto] ([id], [estadoId], [nombre_categoria]) VALUES (1, 1, N'Electrodomésticos')
GO
INSERT [dbo].[categoria_producto] ([id], [estadoId], [nombre_categoria]) VALUES (2, 1, N'Tecnología')
GO
INSERT [dbo].[categoria_producto] ([id], [estadoId], [nombre_categoria]) VALUES (3, 3, N'Oferta')
GO
SET IDENTITY_INSERT [dbo].[categoria_producto] OFF
GO
SET IDENTITY_INSERT [dbo].[compania] ON 
GO
INSERT [dbo].[compania] ([id], [estadoId], [nombre_compania], [ruc], [descripcion], [razon_Social], [direccion_Matriz], [url_img]) VALUES (1, 1, N'El Rosado', N'0941655961', N'Null', N'Null', N'Null', N'Null')
GO
INSERT [dbo].[compania] ([id], [estadoId], [nombre_compania], [ruc], [descripcion], [razon_Social], [direccion_Matriz], [url_img]) VALUES (2, 1, N'Gigatech', N'0999794782', N'NULL', N'NULL', N'NULL', N'NULL')
GO
SET IDENTITY_INSERT [dbo].[compania] OFF
GO
SET IDENTITY_INSERT [dbo].[estado] ON 
GO
INSERT [dbo].[estado] ([id], [descripcion]) VALUES (1, N'Activo')
GO
INSERT [dbo].[estado] ([id], [descripcion]) VALUES (2, N'Inactivo')
GO
INSERT [dbo].[estado] ([id], [descripcion]) VALUES (3, N'Bloqueado')
GO
INSERT [dbo].[estado] ([id], [descripcion]) VALUES (4, N'Ordenado')
GO
INSERT [dbo].[estado] ([id], [descripcion]) VALUES (5, N'Comprado')
GO
INSERT [dbo].[estado] ([id], [descripcion]) VALUES (6, N'Waiting')
GO
INSERT [dbo].[estado] ([id], [descripcion]) VALUES (7, N'Compartido')
GO
INSERT [dbo].[estado] ([id], [descripcion]) VALUES (8, N'Autorizado')
GO
SET IDENTITY_INSERT [dbo].[estado] OFF
GO
SET IDENTITY_INSERT [dbo].[Items] ON 
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (69, 5, 2, 19, 38, 1, CAST(N'2024-01-25T22:25:00.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (70, 5, 2, 33, 40, 1, CAST(N'2024-01-25T22:55:29.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (71, 5, 2, 33, 44, 1, CAST(N'2024-01-25T23:06:44.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (72, 5, 2, 33, 47, 1, CAST(N'2024-01-25T23:11:09.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (74, 5, 2, 34, 50, 1, CAST(N'2024-01-26T03:16:34.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (75, 5, 2, 16, 53, 1, CAST(N'2024-01-26T05:08:46.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (76, 5, 2, 20, 53, 1, CAST(N'2024-01-26T05:08:54.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (77, 5, 2, 34, 53, 1, CAST(N'2024-01-26T05:08:58.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (78, 5, 2, 3, 55, 1, CAST(N'2024-01-26T05:12:56.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (79, 5, 2, 6, 57, 1, CAST(N'2024-01-26T05:13:33.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (80, 5, 2, 33, 59, 1, CAST(N'2024-01-26T05:13:54.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (81, 5, 2, 34, 61, 1, CAST(N'2024-01-26T05:17:31.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (82, 5, 2, 35, 63, 1, CAST(N'2024-01-26T05:18:03.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (83, 5, 2, 33, 65, 1, CAST(N'2024-01-26T05:23:17.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (84, 5, 2, 33, 67, 1, CAST(N'2024-01-26T05:30:16.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (91, 5, 2, 33, 69, 1, CAST(N'2024-01-26T15:24:41.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (92, 5, 2, 34, 71, 1, CAST(N'2024-01-26T15:30:53.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (93, 5, 2, 35, 73, 1, CAST(N'2024-01-26T15:36:09.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (94, 5, 2, 1, 76, 1, CAST(N'2024-01-26T15:54:59.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (95, 5, 2, 35, 77, 1, CAST(N'2024-01-26T16:00:37.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (96, 5, 2, 34, 78, 1, CAST(N'2024-01-26T16:02:40.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (97, 5, 2, 33, 79, 1, CAST(N'2024-01-26T16:07:47.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (99, 5, 2, 1, 80, 1, CAST(N'2024-01-26T16:44:49.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (100, 5, 2, 35, 81, 1, CAST(N'2024-01-27T07:12:42.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (101, 5, 2, 19, 82, 1, CAST(N'2024-01-27T07:15:31.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (102, 5, 2, 1, 83, 1, CAST(N'2024-01-27T07:36:57.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (103, 5, 2, 36, 84, 1, CAST(N'2024-01-27T07:40:33.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (105, 5, 2, 19, 85, 1, CAST(N'2024-01-27T08:14:02.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (106, 5, 2, 26, 86, 1, CAST(N'2024-01-27T08:20:37.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (107, 5, 2, 34, 87, 1, CAST(N'2024-01-27T08:21:16.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (108, 5, 2, 35, 88, 1, CAST(N'2024-01-27T08:39:30.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (109, 5, 2, 33, 89, 1, CAST(N'2024-01-27T08:40:10.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (110, 5, 2, 18, 90, 1, CAST(N'2024-01-27T08:46:01.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (111, 5, 2, 33, 90, 1, CAST(N'2024-01-27T08:47:43.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (112, 5, 2, 36, 90, 1, CAST(N'2024-01-27T08:47:51.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (142, 5, 2, 27, 91, 1, CAST(N'2024-01-27T14:55:24.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (148, 4, 2, 33, NULL, 1, CAST(N'2024-01-27T18:07:04.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (149, 4, 2, 34, NULL, 1, CAST(N'2024-01-27T18:35:18.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (158, 4, 15, 2, NULL, 1, CAST(N'2024-01-27T19:24:31.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (159, 4, 15, 20, NULL, 1, CAST(N'2024-01-27T19:24:43.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (167, 5, 24, 23, 92, 1, CAST(N'2024-01-27T23:04:47.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (168, 5, 24, 35, 92, 1, CAST(N'2024-01-27T23:04:54.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (169, 5, 24, 19, 93, 1, CAST(N'2024-01-27T23:06:49.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (170, 5, 24, 22, 93, 1, CAST(N'2024-01-27T23:06:54.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (171, 5, 24, 10, 93, 1, CAST(N'2024-01-27T23:07:00.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (172, 5, 24, 20, 93, 1, CAST(N'2024-01-27T23:07:05.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (175, 5, 24, 19, 94, 1, CAST(N'2024-01-28T02:17:59.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (176, 5, 24, 8, 94, 1, CAST(N'2024-01-28T02:34:09.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (177, 5, 24, 17, 94, 1, CAST(N'2024-01-28T02:34:20.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (178, 5, 24, 11, 94, 1, CAST(N'2024-01-28T02:34:32.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (179, 5, 24, 33, 94, 1, CAST(N'2024-01-28T02:34:42.000' AS DateTime))
GO
INSERT [dbo].[Items] ([id], [estadoId], [usuarioId], [productoId], [ordenId], [cantidad], [fecha]) VALUES (180, 5, 24, 34, 95, 1, CAST(N'2024-01-28T02:42:50.000' AS DateTime))
GO
SET IDENTITY_INSERT [dbo].[Items] OFF
GO
SET IDENTITY_INSERT [dbo].[Marca_Producto] ON 
GO
INSERT [dbo].[Marca_Producto] ([id], [estadoId], [companiaId], [nombre_marca]) VALUES (1, 1, 1, N'LG')
GO
INSERT [dbo].[Marca_Producto] ([id], [estadoId], [companiaId], [nombre_marca]) VALUES (2, 1, 1, N'Samsung')
GO
INSERT [dbo].[Marca_Producto] ([id], [estadoId], [companiaId], [nombre_marca]) VALUES (3, 1, 1, N'Mabe')
GO
INSERT [dbo].[Marca_Producto] ([id], [estadoId], [companiaId], [nombre_marca]) VALUES (4, 1, 1, N'Indurama')
GO
INSERT [dbo].[Marca_Producto] ([id], [estadoId], [companiaId], [nombre_marca]) VALUES (5, 1, 1, N'Whirlpool')
GO
INSERT [dbo].[Marca_Producto] ([id], [estadoId], [companiaId], [nombre_marca]) VALUES (6, 1, 1, N'Oster')
GO
INSERT [dbo].[Marca_Producto] ([id], [estadoId], [companiaId], [nombre_marca]) VALUES (7, 1, 1, N'TLC')
GO
INSERT [dbo].[Marca_Producto] ([id], [estadoId], [companiaId], [nombre_marca]) VALUES (8, 1, 1, N'HP')
GO
INSERT [dbo].[Marca_Producto] ([id], [estadoId], [companiaId], [nombre_marca]) VALUES (9, 1, 1, N'Sony')
GO
INSERT [dbo].[Marca_Producto] ([id], [estadoId], [companiaId], [nombre_marca]) VALUES (10, 1, 1, N'Apple')
GO
SET IDENTITY_INSERT [dbo].[Marca_Producto] OFF
GO
SET IDENTITY_INSERT [dbo].[Orden] ON 
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (1, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(637.32 AS Decimal(10, 2)), N'Z6h1g.lb.8e54ri', N'norte', N'norte', CAST(N'2024-01-25T14:38:52.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (2, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(3182.62 AS Decimal(10, 2)), N'CQ0ekcrst1goX.P', N'norte', N'norte', CAST(N'2024-01-25T15:42:59.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (3, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(1274.56 AS Decimal(10, 2)), N'icy8FUk4GS6dWau', N'norte', N'norte', CAST(N'2024-01-25T16:29:26.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (4, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(1630.90 AS Decimal(10, 2)), N'IpCbobcmrPok55H', N'norte', N'norte', CAST(N'2024-01-25T18:10:02.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (5, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(358.18 AS Decimal(10, 2)), N'9..90tg97HHhkOU', N'norte', N'norte', CAST(N'2024-01-25T18:11:40.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (6, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(358.18 AS Decimal(10, 2)), N'X@1uYe2WlpdXMPT', N'norte', N'norte', CAST(N'2024-01-25T18:11:42.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (7, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(1683.47 AS Decimal(10, 2)), N'OGK@iHg2UHuL2@Q', N'norte', N'norte', CAST(N'2024-01-25T18:31:17.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (8, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(988.96 AS Decimal(10, 2)), N'3eAqujuZ3e5g3JI', N'norte', N'norte', CAST(N'2024-01-25T20:44:17.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (9, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(1683.47 AS Decimal(10, 2)), N'x9CDlK2eg1E6qJg', N'norte', N'norte', CAST(N'2024-01-25T21:47:11.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (10, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(4334.05 AS Decimal(10, 2)), N'nLv4uX4C8oOiysN', N'norte', N'norte', CAST(N'2024-01-25T21:48:11.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (11, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(1902.47 AS Decimal(10, 2)), N'4lu5r.BroScH9oz', N'norte', N'norte', CAST(N'2024-01-25T21:48:29.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (12, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(1902.47 AS Decimal(10, 2)), N'ladSi.xEw.eoAgo', N'norte', N'norte', CAST(N'2024-01-25T21:48:54.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (13, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(5878.34 AS Decimal(10, 2)), N'ckgtOuRmDAmDIRK', N'norte', N'norte', CAST(N'2024-01-25T22:00:52.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (14, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(1902.47 AS Decimal(10, 2)), N'F..PhSUMoSrheWF', N'norte', N'norte', CAST(N'2024-01-25T22:18:44.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (15, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(1902.47 AS Decimal(10, 2)), N'8.Ao@87CrFIGGbc', N'norte', N'norte', CAST(N'2024-01-25T22:18:47.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (16, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(1902.47 AS Decimal(10, 2)), N'9rr.n8oLieuPrrR', N'norte', N'norte', CAST(N'2024-01-25T22:20:18.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (17, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(1902.47 AS Decimal(10, 2)), N'bFhmQuWepryebOe', N'norte', N'norte', CAST(N'2024-01-25T22:20:20.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (18, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(1902.47 AS Decimal(10, 2)), N'fZcap.repydKdE9', N'norte', N'norte', CAST(N'2024-01-25T22:20:43.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (19, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(1584.29 AS Decimal(10, 2)), N'5ouu7NAl@cdgoft', N'norte', N'norte', CAST(N'2024-01-25T22:24:19.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (20, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(358.18 AS Decimal(10, 2)), N'uBuAhL82.23traY', N'norte', N'norte', CAST(N'2024-01-25T22:25:02.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (21, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(676.36 AS Decimal(10, 2)), N'ilecLKCBb.gGuzR', N'norte', N'norte', CAST(N'2024-01-25T22:26:30.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (22, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(994.54 AS Decimal(10, 2)), N'd6cnYpdOGHcUdSe', N'norte', N'norte', CAST(N'2024-01-25T22:27:10.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (23, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(358.18 AS Decimal(10, 2)), N'4khlv5Wi.Fc3Yrt', N'norte', N'norte', CAST(N'2024-01-25T22:28:31.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (24, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(358.18 AS Decimal(10, 2)), N'zgRKiuvUduzYuUM', N'norte', N'norte', CAST(N'2024-01-25T22:29:20.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (25, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(358.18 AS Decimal(10, 2)), N'nrRWpYuIeBg5bos', N'norte', N'norte', CAST(N'2024-01-25T22:29:21.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (26, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(994.54 AS Decimal(10, 2)), N'oe9cgocDsgN1dd9', N'norte', N'norte', CAST(N'2024-01-25T22:30:54.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (27, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(358.18 AS Decimal(10, 2)), N'uxV9znrI3.uifSz', N'norte', N'norte', CAST(N'2024-01-25T22:30:57.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (28, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(1312.72 AS Decimal(10, 2)), N'cEjtC5q89RurJXJ', N'norte', N'norte', CAST(N'2024-01-25T22:42:14.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (29, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(358.18 AS Decimal(10, 2)), N'b.scoUXj2PydEkQ', N'norte', N'norte', CAST(N'2024-01-25T22:42:18.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (30, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(358.18 AS Decimal(10, 2)), N'gKHfaG0st.4s0Bv', N'norte', N'norte', CAST(N'2024-01-25T22:42:24.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (31, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(358.18 AS Decimal(10, 2)), N'jufMunms01ruxcO', N'norte', N'norte', CAST(N'2024-01-25T22:42:26.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (32, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(358.18 AS Decimal(10, 2)), N'uGbewSeMmceVnvY', N'norte', N'norte', CAST(N'2024-01-25T22:46:40.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (33, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(358.18 AS Decimal(10, 2)), N'eD2Fmur9rcI7bQh', N'norte', N'norte', CAST(N'2024-01-25T22:46:42.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (34, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(358.18 AS Decimal(10, 2)), N'U.cjuEH1H.dMObr', N'norte', N'norte', CAST(N'2024-01-25T22:46:47.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (35, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(358.18 AS Decimal(10, 2)), N'VDmYtPdJrfUpXly', N'norte', N'norte', CAST(N'2024-01-25T22:46:49.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (36, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(358.18 AS Decimal(10, 2)), N'3fW62N9j0yvrDiJ', N'norte', N'norte', CAST(N'2024-01-25T22:48:12.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (37, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(358.18 AS Decimal(10, 2)), N'rjt5ma3TB5rqN2r', N'norte', N'norte', CAST(N'2024-01-25T22:48:13.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (38, 5, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(358.18 AS Decimal(10, 2)), N'czMa8j@Q3we3Vw7', N'norte', N'norte', CAST(N'2024-01-25T22:54:47.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (39, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(590.19 AS Decimal(10, 2)), N'ZYgo1PlsoWaYKvo', N'norte', N'norte', CAST(N'2024-01-25T22:55:32.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (40, 5, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(590.19 AS Decimal(10, 2)), N'..OPJrkrrmiKTjO', N'norte', N'norte', CAST(N'2024-01-25T22:55:34.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (41, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(590.19 AS Decimal(10, 2)), N'zKh.XonJBPShgyB', N'norte', N'norte', CAST(N'2024-01-25T23:06:45.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (42, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(1140.38 AS Decimal(10, 2)), N'irDsaoa9kgar3M0', N'norte', N'norte', CAST(N'2024-01-25T23:09:53.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (43, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(1690.57 AS Decimal(10, 2)), N'YmP7QtK6uck@O@d', N'norte', N'norte', CAST(N'2024-01-25T23:10:04.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (44, 5, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(590.19 AS Decimal(10, 2)), N'egjHmJuaeNu0T2u', N'norte', N'norte', CAST(N'2024-01-25T23:10:57.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (45, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(590.19 AS Decimal(10, 2)), N'X04Ji3VXKdIMrx8', N'norte', N'norte', CAST(N'2024-01-25T23:11:13.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (46, 4, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(590.19 AS Decimal(10, 2)), N'4Ylg9bGpi.r9caA', N'norte', N'norte', CAST(N'2024-01-25T23:13:25.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (47, 5, 2, 1, N'Grupo 8', N'Dawa', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(590.19 AS Decimal(10, 2)), N'ocnvrqtPbuegjJe', N'norte', N'norte', CAST(N'2024-01-25T23:14:59.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (48, 4, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(4784.80 AS Decimal(10, 2)), N'QuQ9FVMXpuGREGW', N'norte', N'norte', CAST(N'2024-01-26T03:16:52.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (49, 4, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(988.96 AS Decimal(10, 2)), N'feFu.xio.o@ep85', N'norte', N'norte', CAST(N'2024-01-26T04:59:47.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (50, 5, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(988.96 AS Decimal(10, 2)), N'7pdaeOqsWG35prH', N'norte', N'norte', CAST(N'2024-01-26T04:59:49.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (51, 4, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(2338.21 AS Decimal(10, 2)), N'mxphbuQUnRhLU7u', N'norte', N'norte', CAST(N'2024-01-26T05:09:01.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (52, 4, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(2988.21 AS Decimal(10, 2)), N'cJipuMjeaNoIcRT', N'norte', N'norte', CAST(N'2024-01-26T05:09:10.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (53, 5, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(2338.21 AS Decimal(10, 2)), N'HuN5.eI1auCAVd@', N'norte', N'norte', CAST(N'2024-01-26T05:09:12.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (54, 4, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(1058.18 AS Decimal(10, 2)), N'i8ub2wzY5vsZcwu', N'norte', N'norte', CAST(N'2024-01-26T05:12:58.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (55, 5, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(1058.18 AS Decimal(10, 2)), N'bDLP4mwsfsZue8r', N'norte', N'norte', CAST(N'2024-01-26T05:13:00.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (56, 4, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(1412.28 AS Decimal(10, 2)), N'7foroCWqujacTIG', N'norte', N'norte', CAST(N'2024-01-26T05:13:35.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (57, 5, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(726.14 AS Decimal(10, 2)), N'Magu.vPiGeb1AkJ', N'norte', N'norte', CAST(N'2024-01-26T05:13:39.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (58, 4, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(590.19 AS Decimal(10, 2)), N'ITHOVEBpQpBg7oe', N'norte', N'norte', CAST(N'2024-01-26T05:13:56.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (59, 5, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(590.19 AS Decimal(10, 2)), N'oeycBuduxMoldZe', N'norte', N'norte', CAST(N'2024-01-26T05:14:01.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (60, 4, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(988.96 AS Decimal(10, 2)), N'egLoOrFiuP21aUe', N'norte', N'norte', CAST(N'2024-01-26T05:17:33.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (61, 5, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(988.96 AS Decimal(10, 2)), N'ES.RdNAmUruiguv', N'norte', N'norte', CAST(N'2024-01-26T05:17:35.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (62, 4, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(259.00 AS Decimal(10, 2)), N'luoCPBTSupUeV65', N'norte', N'norte', CAST(N'2024-01-26T05:18:04.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (63, 5, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(259.00 AS Decimal(10, 2)), N'pKpTtujKINmgpmr', N'norte', N'norte', CAST(N'2024-01-26T05:18:05.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (64, 4, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(590.19 AS Decimal(10, 2)), N'mNJgodXJ.0ek1Mu', N'norte', N'norte', CAST(N'2024-01-26T05:23:19.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (65, 5, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(590.19 AS Decimal(10, 2)), N'JnuYNlv.ugyldrq', N'norte', N'norte', CAST(N'2024-01-26T05:23:21.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (66, 4, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(590.19 AS Decimal(10, 2)), N'pud.Ioq5NoyGuie', N'norte', N'norte', CAST(N'2024-01-26T05:30:18.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (67, 5, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(590.19 AS Decimal(10, 2)), N'wLc7xuoP8EEScS.', N'norte', N'norte', CAST(N'2024-01-26T05:30:19.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (68, 4, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(590.19 AS Decimal(10, 2)), N'm5Y.pUjn@s5lQ.R', N'norte', N'norte', CAST(N'2024-01-26T15:24:43.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (69, 5, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(590.19 AS Decimal(10, 2)), N'BuMTLbc8.TjseLa', N'norte', N'norte', CAST(N'2024-01-26T15:24:51.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (70, 4, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(988.96 AS Decimal(10, 2)), N'jdvPf2sigfY56ni', N'norte', N'norte', CAST(N'2024-01-26T15:30:55.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (71, 5, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(988.96 AS Decimal(10, 2)), N'KdIeUuC.x7UFQW.', N'norte', N'norte', CAST(N'2024-01-26T15:30:56.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (72, 4, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(259.00 AS Decimal(10, 2)), N'xrReL64zOgpo3pX', N'norte', N'norte', CAST(N'2024-01-26T15:36:11.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (73, 5, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(259.00 AS Decimal(10, 2)), N'rD2D.gKrod6oIY8', N'norte', N'norte', CAST(N'2024-01-26T15:36:12.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (74, 4, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(1945.00 AS Decimal(10, 2)), N'5Sgca@JgdZu.Y09', N'norte', N'norte', CAST(N'2024-01-26T15:55:44.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (75, 4, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(1945.00 AS Decimal(10, 2)), N'ceb3gI3VrVkuSC@', N'norte', N'norte', CAST(N'2024-01-26T15:56:12.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (76, 5, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(421.00 AS Decimal(10, 2)), N'eVSUfDtaEFT0xEi', N'norte', N'norte', CAST(N'2024-01-26T15:56:20.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (77, 5, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(259.00 AS Decimal(10, 2)), N'8ZcHqYpFRy4keIl', N'norte', N'norte', CAST(N'2024-01-26T16:00:43.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (78, 5, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(988.96 AS Decimal(10, 2)), N'pXKouO8DGYlquUO', N'norte', N'norte', CAST(N'2024-01-26T16:02:42.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (79, 5, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(590.19 AS Decimal(10, 2)), N'75QQ1VIr3iiuVRg', N'norte', N'norte', CAST(N'2024-01-26T16:09:40.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (80, 5, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(421.00 AS Decimal(10, 2)), N'719883322152372', N'norte', N'norte', CAST(N'2024-01-27T07:10:12.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (81, 5, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(259.00 AS Decimal(10, 2)), N'144973222187099', N'norte', N'norte', CAST(N'2024-01-27T07:14:53.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (82, 5, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(358.18 AS Decimal(10, 2)), N'908475584901747', N'norte', N'norte', CAST(N'2024-01-27T07:18:35.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (83, 5, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(421.00 AS Decimal(10, 2)), N'538715637975857', N'norte', N'norte', CAST(N'2024-01-27T07:37:02.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (84, 5, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(590.17 AS Decimal(10, 2)), N'544981512189294', N'norte', N'norte', CAST(N'2024-01-27T07:50:09.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (85, 5, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(358.18 AS Decimal(10, 2)), N'000656868469824', N'norte', N'norte', CAST(N'2024-01-27T08:20:15.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (86, 5, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(448.17 AS Decimal(10, 2)), N'476239854220469', N'norte', N'norte', CAST(N'2024-01-27T08:20:58.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (87, 5, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(988.96 AS Decimal(10, 2)), N'689822525305047', N'norte', N'norte', CAST(N'2024-01-27T08:33:34.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (88, 5, 2, 1, N'Kevin', N'Vizueta', N'minimussomething@gmail.com', CAST(40.00 AS Decimal(10, 2)), CAST(259.00 AS Decimal(10, 2)), N'126403072713975', N'Guayaquil', N'Guayaquil', CAST(N'2024-01-27T08:39:49.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (89, 5, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(590.19 AS Decimal(10, 2)), N'597817557998179', N'norte', N'norte', CAST(N'2024-01-27T08:45:54.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (90, 5, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(1737.68 AS Decimal(10, 2)), N'097750232970029', N'norte', N'norte', CAST(N'2024-01-27T08:54:00.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (91, 5, 2, 1, N'Kevin', N'Vizueta', N'grupo8@ug.edu.ec', CAST(40.00 AS Decimal(10, 2)), CAST(867.56 AS Decimal(10, 2)), N'069442886227733', N'norte', N'norte', CAST(N'2024-01-27T14:55:27.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (92, 5, 24, 1, N'cliente2', N'customer', N'customer@gmail.com', CAST(40.00 AS Decimal(10, 2)), CAST(1166.67 AS Decimal(10, 2)), N'200775574893236', N'norte', N'norte', CAST(N'2024-01-27T23:06:17.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (93, 5, 24, 1, N'cliente2', N'customer', N'customer@gmail.com', CAST(40.00 AS Decimal(10, 2)), CAST(1776.15 AS Decimal(10, 2)), N'131854561288039', N'norte', N'norte', CAST(N'2024-01-27T23:07:15.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (94, 5, 24, 1, N'Customer', N'Dawa', N'customer2@gmail.com', CAST(40.00 AS Decimal(10, 2)), CAST(1927.24 AS Decimal(10, 2)), N'982099144192428', N'norte', N'norte', CAST(N'2024-01-28T02:36:01.000' AS DateTime))
GO
INSERT [dbo].[Orden] ([id], [estadoId], [usuarioId], [companiaId], [nombre], [apellido], [email], [costo_envio], [total], [token_orden], [direccion_1], [direccion_2], [fecha]) VALUES (95, 5, 24, 1, N'Customer', N'Dawa', N'customer2@gmail.com', CAST(40.00 AS Decimal(10, 2)), CAST(988.96 AS Decimal(10, 2)), N'192693116060302', N'norte', N'norte', CAST(N'2024-01-28T02:42:54.000' AS DateTime))
GO
SET IDENTITY_INSERT [dbo].[Orden] OFF
GO
SET IDENTITY_INSERT [dbo].[producto] ON 
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (1, 1, 1, 4, 1, N'Indurama', N'Cocina a gas Indurama CADIZ 0GY11DDD', 2, 5, N'e.oferta1.png', CAST(381.00 AS Decimal(10, 2)), CAST(381.00 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (2, 1, 1, 5, 1, N'Whirlpool', N'Refrigeradora Side by Side Whirlpool GS51BPP', 3, 5, N'e.oferta2.jpeg', CAST(1325.29 AS Decimal(10, 2)), CAST(1325.29 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (3, 1, 1, 2, 1, N'Samsung', N'Lavadora Samsung WF22R627AP', 5, 5, N'e.oferta3.png', CAST(1018.18 AS Decimal(10, 2)), CAST(1018.18 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (4, 1, 1, 5, 1, N'Whirlpool', N'Microonda Whirlpool WM1807W', 2, 3, N'e.oferta4.png', CAST(250.10 AS Decimal(10, 2)), CAST(250.10 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (5, 1, 1, 7, 1, N'TCL', N'Split alta eficiencia TCL TAC-24CSA/Z2 | 24.000 BTU 100061981', 6, 5, N'e.stock1.jpg', CAST(507.99 AS Decimal(10, 2)), CAST(507.99 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (6, 1, 1, 2, 1, N'Samsung', N'Secadora a Gas Samsung DV22R6270PP/AP | 22Kg', 4, 4, N'e.stock2.jpg', CAST(686.14 AS Decimal(10, 2)), CAST(686.14 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (7, 1, 1, 5, 1, N'Whirlpool', N'Lavadora Automática Whirpool WWG18BSHLA|18Kg', 5, 5, N'e.stock3.jpeg', CAST(407.00 AS Decimal(10, 2)), CAST(407.00 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (8, 1, 1, 6, 1, N'Oster', N'Licuadora Oster BLST4655-013 | Clásica-1.25 Litros 1000619194', 3, 3, N'e.stock4.jpeg', CAST(79.46 AS Decimal(10, 2)), CAST(79.46 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (9, 1, 1, 1, 1, N'LG', N'Estufa de Piso LG 6 Puestos Gas Natural RSG314S Negro', 5, 5, N'e.stock5.jpg', CAST(250.07 AS Decimal(10, 2)), CAST(250.07 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (10, 1, 1, 6, 1, N'Oster', N'Olla Arrocera MG-GP45B Oster | 4.5 Litros 100062044', 1, 2, N'e.stock6.png', CAST(55.72 AS Decimal(10, 2)), CAST(55.72 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (11, 1, 1, 3, 1, N'Mabe', N'Lavadora Semiautomática Mabe LMDX6124HBAB0 | 16Kg', 5, 3, N'e.stock7.jpeg', CAST(329.47 AS Decimal(10, 2)), CAST(329.47 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (12, 1, 1, 3, 1, N'Mabe', N'Secadora a Gas Mabe SMG47N8MSBAB0 | 48 Libras', 3, 5, N'e.stock8.jpg', CAST(970.19 AS Decimal(10, 2)), CAST(970.19 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (13, 1, 1, 3, 1, N'Mabe', N'Refrigeradora Mabe NF RMP840FYEU1|400 Litros', 5, 4, N'e.stock9.jpg', CAST(448.96 AS Decimal(10, 2)), CAST(448.96 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (14, 1, 1, 4, 1, N'Indurama', N'Cocina Indurama Bilbao con Grill con Tablero de acero inoxidable', 2, 3, N'e.stock10.jpg', CAST(479.00 AS Decimal(10, 2)), CAST(479.00 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (15, 1, 1, 1, 1, N'LG', N'Micro-Ondas LG Easy Clean 23 Litros Branco 220V MS2355R', 5, 5, N'e.stock11.jpg', CAST(290.30 AS Decimal(10, 2)), CAST(290.30 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (16, 1, 1, 2, 1, N'Samsung', N'Aire acondicionado Samsung F-H6712 split mural 1X1 con WiFi integrado', 1, 2, N'e.stock12.jpg', CAST(650.00 AS Decimal(10, 2)), CAST(650.00 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (17, 1, 1, 2, 2, N'Samsung', N'Celular Samsung Galaxy A23 Open box 100061875', 5, 5, N't.oferta1.jpg', CAST(609.94 AS Decimal(10, 2)), CAST(609.94 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (18, 1, 1, 9, 2, N'Sony', N'Parlante Activo S15 PRO MKIII Sony 100062000', 3, 5, N't.oferta2.jpg', CAST(597.32 AS Decimal(10, 2)), CAST(597.32 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (19, 1, 1, 2, 2, N'Samsung', N'IMPRESORA EPSON MULTIFUNCION L3250', 5, 5, N't.oferta3.jpg', CAST(318.18 AS Decimal(10, 2)), CAST(318.18 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (20, 1, 1, 7, 2, N'TCL', N'Led Smart TCL  L43P635 | 43'' 4K HDR Google 100061834', 4, 5, N't.oferta4.jpg', CAST(699.25 AS Decimal(10, 2)), CAST(699.25 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (21, 1, 1, 2, 2, N'Samsung', N'Samsung Galaxy Tablet 16GB S Multi-Touch 10.5', 5, 4, N't.stock1.jpg', CAST(507.99 AS Decimal(10, 2)), CAST(507.99 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (22, 1, 1, 8, 2, N'HP', N'ALL IN ONE HP24-DD0011LA 4GB RAM 2T HHD', 5, 5, N't.stock2.jpg', CAST(663.00 AS Decimal(10, 2)), CAST(663.00 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (23, 1, 1, 10, 2, N'Apple', N'IPhone 15 Pro Max 1 TB titanium - Apple', 3, 3, N't.stock3.jpg', CAST(907.67 AS Decimal(10, 2)), CAST(907.67 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (24, 1, 1, 1, 2, N'LG', N'Parlante LG Inalambrico Bluetooht Usb Fm Fh2', 5, 2, N't.stock4.jpg', CAST(79.46 AS Decimal(10, 2)), CAST(79.46 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (25, 1, 1, 2, 2, N'Samsung', N'TABLET SAMSUNG GALAXY A7 SM-T225 OC 2.0GHZ 3GB 32GB', 4, 5, N't.stock5.jpeg', CAST(166.76 AS Decimal(10, 2)), CAST(166.76 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (26, 1, 1, 1, 2, N'LG', N'MONITOR LG 27Inc UltraGear Full HD IPS 1ms Gaming', 5, 1, N't.stock6.jpg', CAST(408.17 AS Decimal(10, 2)), CAST(408.17 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (27, 1, 1, 9, 2, N'Sony', N'Play Station Sony 5 Version BluRay CFI-1200A 16GB', 5, 5, N't.stock7.jpg', CAST(827.56 AS Decimal(10, 2)), CAST(827.56 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (28, 1, 1, 10, 2, N'Apple', N'Tablet Apple iPad Pro 12.9 (2020) 128GB Wifi', 2, 4, N't.stock8.jpg', CAST(439.19 AS Decimal(10, 2)), CAST(439.19 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (29, 1, 1, 10, 2, N'Apple', N'Apple MacBook Pro Laptop i7 2.5GHz 16GB DDR3 Ram 2TB', 5, 3, N't.stock9.jpg', CAST(899.50 AS Decimal(10, 2)), CAST(899.50 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (30, 1, 1, 8, 2, N'HP', N'Impresora HP 651 Ink | Smart Tank Plus 651 Ink Cartridge', 5, 5, N't.stock10.jpg', CAST(390.60 AS Decimal(10, 2)), CAST(390.60 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (31, 1, 1, 1, 2, N'LG', N'Televisor LG OLED B3 77'' 4K Smart TV 2023', 5, 2, N't.stock11.jpg', CAST(750.40 AS Decimal(10, 2)), CAST(750.40 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (32, 1, 1, 2, 2, N'Samsung', N'Auriculares Inalámbricos Samsung Buds Live Bluetooth', 5, 8, N't.stock12.jpg', CAST(42.00 AS Decimal(10, 2)), CAST(42.00 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (33, 1, 1, 2, 3, N'Samsung', N'Led Smart TV UN50AU7000PCZE |50'' 4K Ultra HD', 5, 1, N'h.oferta1.jpg', CAST(550.19 AS Decimal(10, 2)), CAST(720.00 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (34, 1, 1, 3, 3, N'Samsung', N'Mabe Lavadora/Secadora eléctrica 8 programas 44lbs', 5, 3, N'h.oferta2.jpg', CAST(948.96 AS Decimal(10, 2)), CAST(1150.20 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (35, 1, 1, 1, 3, N'LG', N'Aspirador robot LG Vr8604ob Square S10 turbo', 5, 5, N'h.oferta3.jpg', CAST(219.00 AS Decimal(10, 2)), CAST(320.50 AS Decimal(10, 2)))
GO
INSERT [dbo].[producto] ([id], [estadoId], [companiaId], [marca_producto_Id], [categoria_producto_Id], [nombre_producto], [descripcion], [stock], [estrellas], [url_Img], [precio_ahora], [precio_antes]) VALUES (36, 2, 1, 1, 3, N'LG', N'Gaming Laptop 15.6'', Intel Core i5-9300H, NVIDIA GTX 1050', 10, 5, N'h.oferta4.jpg', CAST(990.17 AS Decimal(10, 2)), CAST(732.40 AS Decimal(10, 2)))
GO
SET IDENTITY_INSERT [dbo].[producto] OFF
GO
SET IDENTITY_INSERT [dbo].[rol] ON 
GO
INSERT [dbo].[rol] ([id], [descripcion]) VALUES (1, N'Admin')
GO
INSERT [dbo].[rol] ([id], [descripcion]) VALUES (2, N'Cliente')
GO
INSERT [dbo].[rol] ([id], [descripcion]) VALUES (8, N'Especial')
GO
SET IDENTITY_INSERT [dbo].[rol] OFF
GO
SET IDENTITY_INSERT [dbo].[usuario] ON 
GO
INSERT [dbo].[usuario] ([id], [estadoId], [companiaId], [rolId], [nombre], [apellido], [email], [password], [maxintentos], [intentosfallidos]) VALUES (2, 1, 1, 1, N'Kevin', N'Vizueta', N'kevinvizuetaj@gmail.com', N'123456', 5, 5)
GO
INSERT [dbo].[usuario] ([id], [estadoId], [companiaId], [rolId], [nombre], [apellido], [email], [password], [maxintentos], [intentosfallidos]) VALUES (15, 1, 1, 2, N'Andrea', N'Perez', N'cliente@gmail.com', N'12345', 5, 5)
GO
INSERT [dbo].[usuario] ([id], [estadoId], [companiaId], [rolId], [nombre], [apellido], [email], [password], [maxintentos], [intentosfallidos]) VALUES (24, 1, 1, 1, N'Kevin', N'Vizueta', N'kevin.vizuetajar@ug.edu.ec', N'abcd', 4, 4)
GO
SET IDENTITY_INSERT [dbo].[usuario] OFF
GO
ALTER TABLE [dbo].[categoria_producto]  WITH CHECK ADD FOREIGN KEY([estadoId])
REFERENCES [dbo].[estado] ([id])
GO
ALTER TABLE [dbo].[compania]  WITH CHECK ADD FOREIGN KEY([estadoId])
REFERENCES [dbo].[estado] ([id])
GO
ALTER TABLE [dbo].[Items]  WITH CHECK ADD FOREIGN KEY([estadoId])
REFERENCES [dbo].[estado] ([id])
GO
ALTER TABLE [dbo].[Items]  WITH CHECK ADD FOREIGN KEY([ordenId])
REFERENCES [dbo].[Orden] ([id])
GO
ALTER TABLE [dbo].[Items]  WITH CHECK ADD FOREIGN KEY([productoId])
REFERENCES [dbo].[producto] ([id])
GO
ALTER TABLE [dbo].[Items]  WITH CHECK ADD FOREIGN KEY([usuarioId])
REFERENCES [dbo].[usuario] ([id])
GO
ALTER TABLE [dbo].[Marca_Producto]  WITH CHECK ADD FOREIGN KEY([companiaId])
REFERENCES [dbo].[compania] ([id])
GO
ALTER TABLE [dbo].[Marca_Producto]  WITH CHECK ADD FOREIGN KEY([estadoId])
REFERENCES [dbo].[estado] ([id])
GO
ALTER TABLE [dbo].[Orden]  WITH CHECK ADD FOREIGN KEY([companiaId])
REFERENCES [dbo].[compania] ([id])
GO
ALTER TABLE [dbo].[Orden]  WITH CHECK ADD FOREIGN KEY([estadoId])
REFERENCES [dbo].[estado] ([id])
GO
ALTER TABLE [dbo].[Orden]  WITH CHECK ADD FOREIGN KEY([usuarioId])
REFERENCES [dbo].[usuario] ([id])
GO
ALTER TABLE [dbo].[producto]  WITH CHECK ADD FOREIGN KEY([categoria_producto_Id])
REFERENCES [dbo].[categoria_producto] ([id])
GO
ALTER TABLE [dbo].[producto]  WITH CHECK ADD FOREIGN KEY([companiaId])
REFERENCES [dbo].[compania] ([id])
GO
ALTER TABLE [dbo].[producto]  WITH CHECK ADD FOREIGN KEY([estadoId])
REFERENCES [dbo].[estado] ([id])
GO
ALTER TABLE [dbo].[producto]  WITH CHECK ADD FOREIGN KEY([marca_producto_Id])
REFERENCES [dbo].[Marca_Producto] ([id])
GO
ALTER TABLE [dbo].[usuario]  WITH CHECK ADD FOREIGN KEY([companiaId])
REFERENCES [dbo].[compania] ([id])
GO
ALTER TABLE [dbo].[usuario]  WITH CHECK ADD FOREIGN KEY([estadoId])
REFERENCES [dbo].[estado] ([id])
GO
ALTER TABLE [dbo].[usuario]  WITH CHECK ADD FOREIGN KEY([rolId])
REFERENCES [dbo].[rol] ([id])
GO
/****** Object:  StoredProcedure [dbo].[sp_Actualizar_CategoriaProducto]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

create proc [dbo].[sp_Actualizar_CategoriaProducto]
@id int,
@estadoId INT,
@nombre_categoria VARCHAR(50),
@accion bit output
as
	begin
		UPDATE categoria_producto
        SET estadoId = @estadoId, nombre_categoria = @nombre_categoria  WHERE id = @id;
		set @accion=1
	end
GO
/****** Object:  StoredProcedure [dbo].[sp_Actualizar_Compania]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

create proc [dbo].[sp_Actualizar_Compania]
@id int,
@estadoId int,
@nombre_compania varchar(50),
@ruc varchar(50),
@descripcion varchar(50),
@razon_Social varchar(50),
@direccion_Matriz varchar(50),
@url_img  varchar(50),
@accion bit output
as
	begin
	  UPDATE compania
        SET estadoId = @estadoId, nombre_compania = @nombre_compania, ruc = @ruc,
            descripcion = @descripcion, razon_Social = @razon_Social, direccion_Matriz = @direccion_Matriz,
			url_img=@url_img
        WHERE id = @id;
		set @accion=1
	end
GO
/****** Object:  StoredProcedure [dbo].[sp_Actualizar_Estado]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

create proc [dbo].[sp_Actualizar_Estado]
@id int,
@descripcion varchar(50),
@accion bit output
as
	begin
		update estado set descripcion=@descripcion where id=@id
		set @accion=1
	end
GO
/****** Object:  StoredProcedure [dbo].[sp_Actualizar_Item]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

create proc [dbo].[sp_Actualizar_Item]
@id int,
@estadoId INT,
@usuarioId INT,
@productoId INT,
@ordenId INT,
@cantidad INT,
@fecha DATETIME,
@accion bit output
as
	begin
		 UPDATE Items
        SET estadoId = @estadoId, usuarioId = @usuarioId, productoId = @productoId,
            ordenId = @ordenId, cantidad = @cantidad, fecha = @fecha
        WHERE id = @id;
		set @accion=1
	end
GO
/****** Object:  StoredProcedure [dbo].[sp_Actualizar_MarcaProducto]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

create proc [dbo].[sp_Actualizar_MarcaProducto]
@id int,
@companiaId int,
@estadoId INT,
@nombre_marca VARCHAR(50),
@accion bit output
as
	begin
		  UPDATE Marca_Producto
        SET estadoId = @estadoId, nombre_marca = @nombre_marca
        WHERE id = @id;
		set @accion=1
	end
GO
/****** Object:  StoredProcedure [dbo].[sp_Actualizar_Orden]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

create proc [dbo].[sp_Actualizar_Orden]
@id int,
@estadoId int,
@usuarioId int,
@companiaId int,
@nombre varchar(50),
@apellido varchar(50),
@email varchar(50),
@costo_envio decimal(10,2),
@total decimal(10,2),
@token_orden varchar(50),
@direccion_1 varchar(50),
@direccion_2 varchar(50),
@fecha datetime,
@accion bit output
as
	begin
	  UPDATE Orden
        SET estadoId = @estadoId, usuarioId= @usuarioId, companiaId = @companiaId,
            nombre = @nombre, apellido = @apellido, email = @email, costo_envio = @costo_envio, total = @total, token_orden = @token_orden,
			direccion_1 = @direccion_1, direccion_2 = @direccion_2, fecha = @fecha
        WHERE id = @id;
		set @accion=1
	end
GO
/****** Object:  StoredProcedure [dbo].[sp_Actualizar_Producto]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

create proc [dbo].[sp_Actualizar_Producto]
@id int,
@estadoId int,
@companiaId int,
@marca_producto_Id int,
@categoria_producto_Id int,
@nombre_producto VARCHAR(50),
@descripcion VARCHAR(500),
@stock int,
@estrellas int,
@url_Img VARCHAR(50),
@precio_ahora DECIMAL(10, 2),
@precio_antes DECIMAL(10, 2),
@accion bit output
as
	begin
		  UPDATE producto
        SET estadoId = @estadoId, companiaId = @companiaId, marca_producto_Id = @marca_producto_Id, categoria_producto_Id = @categoria_producto_Id,
            nombre_producto = @nombre_producto, descripcion = @descripcion, stock = @stock, estrellas = @estrellas, url_Img = @url_Img,
            precio_ahora = @precio_ahora, precio_antes = @precio_antes
        WHERE id = @id;
		set @accion=1
	end
GO
/****** Object:  StoredProcedure [dbo].[sp_Actualizar_Rol]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

create proc [dbo].[sp_Actualizar_Rol]
@id int,
@descripcion varchar(50),
@accion bit output
as
	begin
		update rol set descripcion=@descripcion where id=@id
		set @accion=1
	end
GO
/****** Object:  StoredProcedure [dbo].[sp_Actualizar_Usuario]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

create proc [dbo].[sp_Actualizar_Usuario]
@id int,
@estadoId int,
@companiaId int,
@rolId int,
@nombre varchar(50),
@apellido varchar(50),
@email varchar(50),
@password  varchar(50),
@maxintentos  int,
@intentosfallidos int,
@accion bit output
as
	begin
		update usuario set estadoId=@estadoId,rolId=@rolId, nombre=@nombre, apellido=@apellido,email=@email,
		password=@password,maxintentos=@maxintentos, intentosfallidos=@intentosfallidos where id=@id
		set @accion=1
	end
GO
/****** Object:  StoredProcedure [dbo].[sp_consultar_categorias_producto]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_consultar_categorias_producto]
AS
BEGIN
    SELECT * FROM categoria_producto ORDER BY id;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_consultar_compania]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_consultar_compania]
AS
BEGIN
    SELECT * FROM compania ORDER BY id;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_consultar_items]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_consultar_items]
AS
BEGIN
    SELECT * FROM Items ORDER BY id;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_consultar_ordenes]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_consultar_ordenes]
AS
BEGIN
    SELECT * FROM Orden ORDER BY id;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_consultar_productoId]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_consultar_productoId]
@id int
AS
BEGIN
    SELECT * FROM producto  WHERE id = @id;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_consultar_productos]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[sp_consultar_productos]
AS
BEGIN
    SELECT * FROM producto ORDER BY id;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_Eliminar_CategoriaProducto]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

create proc [dbo].[sp_Eliminar_CategoriaProducto]
@id int,
@accion bit output
as
	begin
	DELETE FROM categoria_producto
        WHERE id = @id;
	set @accion=1
end
GO
/****** Object:  StoredProcedure [dbo].[sp_Eliminar_Compania]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

create proc [dbo].[sp_Eliminar_Compania]
@id int,
@accion bit output
as
	begin
	 DELETE FROM compania WHERE id = @id;
	set @accion=1
end
GO
/****** Object:  StoredProcedure [dbo].[sp_Eliminar_Estado]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

create proc [dbo].[sp_Eliminar_Estado]
@id int,
@accion bit output
as
	begin
	delete from estado where id=@id
	set @accion=1
end
GO
/****** Object:  StoredProcedure [dbo].[sp_Eliminar_Item]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

create proc [dbo].[sp_Eliminar_Item]
@id int,
@accion bit output
as
	begin
	 DELETE FROM Items
        WHERE id = @id;
	set @accion=1
end
GO
/****** Object:  StoredProcedure [dbo].[sp_Eliminar_Marca_Producto]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

create proc [dbo].[sp_Eliminar_Marca_Producto]
@id int,
@accion bit output
as
	begin
	  DELETE FROM Marca_Producto
        WHERE id = @id;
	set @accion=1
end
GO
/****** Object:  StoredProcedure [dbo].[sp_Eliminar_Orden]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

create proc [dbo].[sp_Eliminar_Orden]
@id int,
@accion bit output
as
	begin
	 DELETE FROM Orden WHERE id = @id;
	set @accion=1
end
GO
/****** Object:  StoredProcedure [dbo].[sp_Eliminar_Producto]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

create proc [dbo].[sp_Eliminar_Producto]
@id int,
@accion bit output
as
	begin
	 DELETE FROM producto
        WHERE id = @id;
	set @accion=1
end
GO
/****** Object:  StoredProcedure [dbo].[sp_Eliminar_Rol]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

create proc [dbo].[sp_Eliminar_Rol]
@id int,
@accion bit output
as
	begin
	delete from rol where id=@id
	set @accion=1
end
GO
/****** Object:  StoredProcedure [dbo].[sp_Eliminar_Usuario]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

create proc [dbo].[sp_Eliminar_Usuario]
@id int,
@accion bit output
as
	begin
	delete from usuario where id=@id
	set @accion=1
end
GO
/****** Object:  StoredProcedure [dbo].[sp_listar_compania]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_listar_compania]
AS
BEGIN
    SELECT * FROM compania ORDER BY id;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_listar_estados]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

create proc [dbo].[sp_listar_estados]
as
select * from estado order by id
GO
/****** Object:  StoredProcedure [dbo].[sp_listar_marcas_producto]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_listar_marcas_producto]
AS
BEGIN
    SELECT * FROM Marca_Producto ORDER BY id;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_listar_roles]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

create proc [dbo].[sp_listar_roles]
as
select * from rol order by id
GO
/****** Object:  StoredProcedure [dbo].[sp_listar_usuarios]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

create proc [dbo].[sp_listar_usuarios]
as
select * from usuario order by id
GO
/****** Object:  StoredProcedure [dbo].[sp_Registrar_CategoriaProducto]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


---------CategoriaProducto
create proc [dbo].[sp_Registrar_CategoriaProducto]
@estadoId INT,
@nombre_categoria VARCHAR(50),
@accion bit output
as
	begin
	    INSERT INTO categoria_producto (estadoId, nombre_categoria)
        VALUES (@estadoId, @nombre_categoria);
	set @accion=1
end
GO
/****** Object:  StoredProcedure [dbo].[sp_Registrar_Compania]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-----Compania
create proc [dbo].[sp_Registrar_Compania]
@estadoId int,
@nombre_compania varchar(50),
@ruc varchar(50),
@descripcion varchar(50),
@razon_Social varchar(50),
@direccion_Matriz varchar(50),
@url_img  varchar(50),
@accion bit output
as
	begin
		 INSERT INTO compania (estadoId,nombre_compania,ruc, descripcion,razon_Social,direccion_Matriz,url_img)
			VALUES (@estadoId, @nombre_compania, @ruc, @descripcion,@razon_Social,@direccion_Matriz,@url_img);
		set @accion=1
	end
GO
/****** Object:  StoredProcedure [dbo].[sp_Registrar_Estado]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


------Estado
create proc [dbo].[sp_Registrar_Estado]
@descripcion varchar(50),
@accion bit output
as
	begin
		insert into estado(descripcion)
		values(@descripcion)
		set @accion=1
	end
GO
/****** Object:  StoredProcedure [dbo].[sp_Registrar_Item]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

---------CategoriaProducto
create proc [dbo].[sp_Registrar_Item]
@estadoId INT,
@usuarioId INT,
@productoId INT,
@ordenId INT = NULL,
@cantidad INT,
@fecha DATETIME,
@accion bit output
as
	begin
	    INSERT INTO Items (estadoId, usuarioId, productoId, ordenId, cantidad, fecha)
        VALUES (@estadoId, @usuarioId, @productoId, @ordenId, @cantidad, @fecha);
	set @accion=1
end
GO
/****** Object:  StoredProcedure [dbo].[sp_Registrar_MarcaProducto]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

---------MarcaProducto
create proc [dbo].[sp_Registrar_MarcaProducto]
@companiaId int,
@estadoId INT,
@nombre_marca VARCHAR(50),
@accion bit output
as
	begin
	   INSERT INTO Marca_Producto (companiaId,estadoId, nombre_marca)
        VALUES (@companiaId,@estadoId, @nombre_marca);
	set @accion=1
end
GO
/****** Object:  StoredProcedure [dbo].[sp_Registrar_Orden]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-------Orden
create proc [dbo].[sp_Registrar_Orden]
@estadoId int,
@usuarioId int,
@companiaId int,
@nombre varchar(50),
@apellido varchar(50),
@email varchar(50),
@costo_envio decimal(10,2),
@total decimal(10,2),
@token_orden varchar(50),
@direccion_1 varchar(50),
@direccion_2 varchar(50),
@fecha datetime,
@accion bit output
as
	begin
		 INSERT INTO Orden (estadoId,usuarioId,companiaId, nombre,apellido,email,costo_envio,total, token_orden, direccion_1, direccion_2, fecha)
			VALUES (@estadoId,@usuarioId,@companiaId, @nombre,@apellido,@email,@costo_envio,@total, @token_orden, @direccion_1, @direccion_2, @fecha);
		set @accion=1
	end
GO
/****** Object:  StoredProcedure [dbo].[sp_Registrar_Producto]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


---------Producto
create proc [dbo].[sp_Registrar_Producto]
@companiaId int,
@estadoId INT,
@marca_producto_Id INT,
@categoria_producto_Id INT,
@nombre_producto VARCHAR(50),
@descripcion VARCHAR(500),
@stock INT,
@estrellas INT,
@url_Img VARCHAR(50),
@precio_ahora DECIMAL(10, 2),
@precio_antes DECIMAL(10, 2),
@accion bit output
as
	begin
	   INSERT INTO producto (estadoId, companiaId, marca_producto_Id, categoria_producto_Id, nombre_producto, descripcion, stock, estrellas, url_Img, precio_ahora, precio_antes)
        VALUES (@estadoId, @companiaId, @marca_producto_Id, @categoria_producto_Id, @nombre_producto, @descripcion, @stock, @estrellas, @url_Img, @precio_ahora, @precio_antes);
	set @accion=1
end
GO
/****** Object:  StoredProcedure [dbo].[sp_Registrar_Rol]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


------Rol
create proc [dbo].[sp_Registrar_Rol]
@descripcion varchar(50),
@accion bit output
as
	begin
		insert into rol(descripcion)
		values(@descripcion)
		set @accion=1
	end
GO
/****** Object:  StoredProcedure [dbo].[sp_Registrar_Usuario]    Script Date: 28/01/2024 19:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


------Usuario
create proc [dbo].[sp_Registrar_Usuario]
@estadoId int,
@companiaId int,
@rolId int,
@nombre varchar(50),
@apellido varchar(50),
@email varchar(50),
@password  varchar(50),
@maxintentos  int,
@intentosfallidos int,
@accion bit output
as
	begin
		insert into usuario(estadoId,companiaId,rolId,nombre,apellido,email,password,maxintentos,intentosfallidos)
		values(@estadoId,@companiaId,@rolId,@nombre,@apellido,@email,@password,@maxintentos,@intentosfallidos)
		set @accion=1
	end
GO
USE [master]
GO
ALTER DATABASE [Electrostore] SET  READ_WRITE 
GO
