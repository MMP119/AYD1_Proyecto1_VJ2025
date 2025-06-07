CREATE DATABASE IF NOT EXISTS SubscriptionPlatform
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE SubscriptionPlatform;


CREATE TABLE User(
	UserId INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(150) NOT NULL,
    Email VARCHAR(150) NOT NULL UNIQUE,
    Rol  VARCHAR(50) CHECK (Rol IN ('user', 'administrator')),
    SessionStatus VARCHAR(20) DEFAULT 'inactive' CHECK (SessionStatus IN ('active','inactive')),
    AccountStatus VARCHAR(20) DEFAULT 'active' CHECK (AccountStatus IN ('active','deactivated','deleted')),
    Password VARCHAR(250) NOT NULL,
    ConfirmedEmail VARCHAR(20) DEFAULT 'no' CHECK(ConfirmedEmail IN ('yes','no'))NOT NULL,
    Username VARCHAR(20) NOT NULL UNIQUE,
    ConfirmationCode VARCHAR(64),
    RegisterDate DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ALTER TABLE User CHANGE User Username VARCHAR(20) NOT NULL UNIQUE;


CREATE TABLE Service(
	ServiceId INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(150) NOT NULL,
    Category VARCHAR(50) NOT NULL,
    Description VARCHAR(250)
);

CREATE TABLE Plan(
    PlanId INT PRIMARY KEY AUTO_INCREMENT,
    ServiceId INT NOT NULL,
    Type VARCHAR(20) CHECK (Type IN ('monthly','annual')) NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    CONSTRAINT FK_Service_Plan FOREIGN KEY (ServiceId) REFERENCES Service(ServiceId)
);

CREATE TABLE Subscription(
    SubscriptionId INT PRIMARY KEY AUTO_INCREMENT,
    UserId INT NOT NULL,
    PlanId INT NOT NULL,
    StartDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    EndDate DATETIME,
    Status VARCHAR(20) DEFAULT 'active' CHECK (Status IN ('active','cancelled','expired')),
    AmountPaid DECIMAL(10,2) NOT NULL,
    PaymentMethod VARCHAR(20) CHECK (PaymentMethod IN ('card','cash','wallet')) NOT NULL,
    CONSTRAINT FK_User_Subscription FOREIGN KEY (UserId) REFERENCES User(UserId),
    CONSTRAINT FK_Plan_Subscription FOREIGN KEY (PlanId) REFERENCES Plan(PlanId)
);

CREATE TABLE PaymentMethod(
    PaymentMethodId INT PRIMARY KEY AUTO_INCREMENT,
    UserId INT NOT NULL,
    Type VARCHAR(20) CHECK (Type IN ('card','cash','wallet')) NOT NULL,
    CardNumber VARCHAR(20),
    CardHolder VARCHAR(150),
    ExpiryDate VARCHAR(7),
    WalletBalance DECIMAL(10,2) DEFAULT 0,
    CONSTRAINT FK_User_PaymentMethod FOREIGN KEY (UserId) REFERENCES User(UserId)
);

CREATE TABLE WalletTransaction(
    TransactionId INT PRIMARY KEY AUTO_INCREMENT,
    UserId INT NOT NULL,
    Type VARCHAR(20) CHECK (Type IN ('recharge','deduction')) NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    TransactionDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_User_WalletTransaction FOREIGN KEY (UserId) REFERENCES User(UserId)
);

CREATE TABLE Notification(
    NotificationId INT PRIMARY KEY AUTO_INCREMENT,
    UserId INT NOT NULL,
    Message VARCHAR(250) NOT NULL,
    Type VARCHAR(30) CHECK (Type IN ('expiration','payment_confirmation','other')) NOT NULL,
    NotificationDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    ReadStatus VARCHAR(10) DEFAULT 'no' CHECK (ReadStatus IN ('yes','no')),
    CONSTRAINT FK_User_Notification FOREIGN KEY (UserId) REFERENCES User(UserId)
);


-- Insertar datos en la tabla User
-- Nota: las contraseñas de usuario son test para todos
INSERT INTO User (Name, Email, Rol, SessionStatus, AccountStatus, Password, ConfirmedEmail, Username) VALUES
('Juan Pérez', 'juan.perez@email.com', 'user', 'active', 'active', '$2a$12$qrSpR.YfjJjnr.xXMzhkFOcP/hOcrT.JM09Jetoj0pdAcHMu.uGiG', 'yes', 'juanp'),
('María García', 'maria.garcia@email.com', 'administrator', 'inactive', 'active', '$2a$12$qrSpR.YfjJjnr.xXMzhkFOcP/hOcrT.JM09Jetoj0pdAcHMu.uGiG', 'yes', 'mariag'),
('Carlos López', 'carlos.lopez@email.com', 'user', 'active', 'active', '$2a$12$qrSpR.YfjJjnr.xXMzhkFOcP/hOcrT.JM09Jetoj0pdAcHMu.uGiG', 'yes', 'carlosl'),
('Ana Martínez', 'ana.martinez@email.com', 'user', 'inactive', 'active', '$2a$12$qrSpR.YfjJjnr.xXMzhkFOcP/hOcrT.JM09Jetoj0pdAcHMu.uGiG', 'no', 'anam'),
('Luis Rodríguez', 'luis.rodriguez@email.com', 'user', 'active', 'deactivated', '$2a$12$qrSpR.YfjJjnr.xXMzhkFOcP/hOcrT.JM09Jetoj0pdAcHMu.uGiG', 'yes', 'luisr'),
('Sofia Hernández', 'sofia.hernandez@email.com', 'user', 'active', 'active', '$2a$12$qrSpR.YfjJjnr.xXMzhkFOcP/hOcrT.JM09Jetoj0pdAcHMu.uGiG', 'yes', 'sofiah'),
('Diego Morales', 'diego.morales@email.com', 'administrator', 'active', 'active', '$2a$12$qrSpR.YfjJjnr.xXMzhkFOcP/hOcrT.JM09Jetoj0pdAcHMu.uGiG', 'yes', 'diegom'),
('Carmen Silva', 'carmen.silva@email.com', 'user', 'inactive', 'active', '$2a$12$qrSpR.YfjJjnr.xXMzhkFOcP/hOcrT.JM09Jetoj0pdAcHMu.uGiG', 'yes', 'carmens'),
('Roberto Vargas', 'roberto.vargas@email.com', 'user', 'active', 'active', '$2a$12$qrSpR.YfjJjnr.xXMzhkFOcP/hOcrT.JM09Jetoj0pdAcHMu.uGiG', 'no', 'robertov'),
('Elena Castro', 'elena.castro@email.com', 'user', 'active', 'active', '$2a$12$qrSpR.YfjJjnr.xXMzhkFOcP/hOcrT.JM09Jetoj0pdAcHMu.uGiG', 'yes', 'elenac');

-- Insertar datos en la tabla Service
INSERT INTO Service (Name, Category, Description) VALUES
('Netflix Premium', 'Streaming', 'Servicio de streaming de video con contenido 4K'),
('Spotify Premium', 'Música', 'Servicio de streaming de música sin anuncios'),
('Adobe Creative Cloud', 'Software', 'Suite completa de herramientas de diseño y creatividad'),
('Microsoft Office 365', 'Productividad', 'Suite de oficina con Word, Excel, PowerPoint y más'),
('Amazon Prime', 'E-commerce', 'Envíos gratis y contenido de video incluido'),
('YouTube Premium', 'Streaming', 'Videos sin anuncios y música incluida'),
('Canva Pro', 'Diseño', 'Herramienta de diseño gráfico profesional'),
('Dropbox Business', 'Almacenamiento', 'Almacenamiento en la nube para equipos'),
('Zoom Pro', 'Comunicación', 'Videoconferencias profesionales'),
('GitHub Pro', 'Desarrollo', 'Repositorios privados ilimitados para desarrolladores');

-- Insertar datos en la tabla Plan
INSERT INTO Plan (ServiceId, Type, Price) VALUES
(1, 'monthly', 15.99),
(1, 'annual', 159.99),
(2, 'monthly', 9.99),
(2, 'annual', 99.99),
(3, 'monthly', 52.99),
(3, 'annual', 599.88),
(4, 'monthly', 12.99),
(4, 'annual', 139.99),
(5, 'monthly', 14.99),
(5, 'annual', 139.00),
(6, 'monthly', 11.99),
(6, 'annual', 119.88),
(7, 'monthly', 12.99),
(7, 'annual', 119.40),
(8, 'monthly', 20.00),
(8, 'annual', 200.00),
(9, 'monthly', 14.99),
(9, 'annual', 149.90),
(10, 'monthly', 4.00),
(10, 'annual', 48.00);

-- Insertar datos en la tabla Subscription
INSERT INTO Subscription (UserId, PlanId, StartDate, EndDate, Status, AmountPaid, PaymentMethod) VALUES
(1, 1, '2024-01-15 10:30:00', '2024-02-15 10:30:00', 'active', 15.99, 'card'),
(1, 3, '2024-02-01 14:20:00', '2024-03-01 14:20:00', 'active', 9.99, 'wallet'),
(2, 5, '2024-01-10 09:15:00', '2024-12-10 09:15:00', 'active', 599.88, 'card'),
(3, 7, '2024-03-01 16:45:00', '2024-04-01 16:45:00', 'active', 12.99, 'card'),
(3, 9, '2024-02-15 11:30:00', '2025-02-15 11:30:00', 'active', 139.00, 'wallet'),
(4, 2, '2023-12-01 08:00:00', '2024-12-01 08:00:00', 'expired', 159.99, 'card'),
(5, 11, '2024-01-20 13:10:00', '2024-02-20 13:10:00', 'cancelled', 11.99, 'cash'),
(6, 4, '2024-02-10 15:25:00', '2025-02-10 15:25:00', 'active', 99.99, 'card'),
(7, 13, '2024-03-05 12:00:00', '2025-03-05 12:00:00', 'active', 119.40, 'wallet'),
(8, 8, '2024-01-25 17:30:00', '2025-01-25 17:30:00', 'active', 139.99, 'card'),
(9, 15, '2024-02-20 10:45:00', '2024-03-20 10:45:00', 'active', 14.99, 'card'),
(10, 6, '2024-01-05 14:15:00', '2025-01-05 14:15:00', 'active', 599.88, 'wallet');

-- Insertar datos en la tabla PaymentMethod
INSERT INTO PaymentMethod (UserId, Type, CardNumber, CardHolder, ExpiryDate, WalletBalance) VALUES
(1, 'card', '1234567890123456', 'Juan Pérez', '12/2027', 0.00),
(1, 'wallet', NULL, NULL, NULL, 150.75),
(2, 'card', '2345678901234567', 'María García', '08/2026', 0.00),
(3, 'card', '3456789012345678', 'Carlos López', '03/2028', 0.00),
(3, 'wallet', NULL, NULL, NULL, 89.50),
(4, 'card', '4567890123456789', 'Ana Martínez', '11/2025', 0.00),
(5, 'cash', NULL, NULL, NULL, 0.00),
(6, 'card', '5678901234567890', 'Sofia Hernández', '06/2027', 0.00),
(7, 'wallet', NULL, NULL, NULL, 275.20),
(8, 'card', '6789012345678901', 'Carmen Silva', '09/2026', 0.00),
(9, 'card', '7890123456789012', 'Roberto Vargas', '01/2029', 0.00),
(10, 'wallet', NULL, NULL, NULL, 320.45);

-- Insertar datos en la tabla WalletTransaction
INSERT INTO WalletTransaction (UserId, Type, Amount, TransactionDate) VALUES
(1, 'recharge', 200.00, '2024-01-01 12:00:00'),
(1, 'deduction', 9.99, '2024-02-01 14:20:00'),
(1, 'deduction', 39.26, '2024-02-15 16:30:00'),
(3, 'recharge', 150.00, '2024-01-15 10:15:00'),
(3, 'deduction', 139.00, '2024-02-15 11:30:00'),
(3, 'recharge', 78.50, '2024-03-01 09:45:00'),
(7, 'recharge', 300.00, '2024-02-01 14:30:00'),
(7, 'deduction', 24.80, '2024-02-10 11:20:00'),
(10, 'recharge', 400.00, '2023-12-15 16:45:00'),
(10, 'deduction', 79.55, '2024-01-10 13:25:00'),
(10, 'recharge', 100.00, '2024-02-20 15:10:00');

-- Insertar datos en la tabla Notification
INSERT INTO Notification (UserId, Message, Type, NotificationDate, ReadStatus) VALUES
(1, 'Tu suscripción a Netflix Premium expira en 3 días', 'expiration', '2024-02-12 09:00:00', 'yes'),
(1, 'Pago confirmado por $9.99 para Spotify Premium', 'payment_confirmation', '2024-02-01 14:21:00', 'yes'),
(2, 'Bienvenido a Adobe Creative Cloud', 'other', '2024-01-10 09:16:00', 'yes'),
(3, 'Tu suscripción a Microsoft Office 365 expira en 7 días', 'expiration', '2024-03-25 08:30:00', 'no'),
(3, 'Pago confirmado por $139.00 para Amazon Prime', 'payment_confirmation', '2024-02-15 11:31:00', 'yes'),
(4, 'Tu suscripción a Netflix Premium ha expirado', 'expiration', '2024-12-01 08:01:00', 'no'),
(5, 'Suscripción a YouTube Premium cancelada exitosamente', 'other', '2024-02-05 10:15:00', 'yes'),
(6, 'Pago confirmado por $99.99 para Spotify Premium', 'payment_confirmation', '2024-02-10 15:26:00', 'yes'),
(7, 'Tu saldo de wallet ha sido recargado con $300.00', 'other', '2024-02-01 14:31:00', 'yes'),
(8, 'Pago confirmado por $139.99 para Microsoft Office 365', 'payment_confirmation', '2024-01-25 17:31:00', 'no'),
(9, 'Tu suscripción a Zoom Pro expira en 5 días', 'expiration', '2024-03-15 12:00:00', 'no'),
(10, 'Bienvenido a Adobe Creative Cloud', 'other', '2024-01-05 14:16:00', 'yes');



-- SELECT * FROM USER;
-- SELECT * FROM SUBSCRIPTION;
-- SELECT s.NAME, s.SERVICEID, p.SERVICEID, us.Name FROM SERVICE AS s
-- INNER JOIN PLAN AS p ON P.PLANID = s.SERVICEID
-- INNER JOIN USER AS us ON us.USERID = p.PLANID;
-- SELECT * FROM SERVICE;