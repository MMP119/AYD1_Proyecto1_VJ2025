CREATE DATABASE IF NOT EXISTS SubscriptionPlatform;

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
    User VARCHAR(20) NOT NULL UNIQUE,
    RegisterDate DATETIME DEFAULT CURRENT_TIMESTAMP
);

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




