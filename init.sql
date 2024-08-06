-- Create table "users"
CREATE TABLE IF NOT EXISTS users (
    userId INT NOT NULL UNIQUE AUTO_INCREMENT,
    email VARCHAR(50) NOT NULL,
    username VARCHAR(50),
    image VARCHAR(255),
    provider VARCHAR(30) NOT NULL,
    name VARCHAR(150),
    password VARCHAR(255),
    bio TEXT,
    birthday DATE,
    phoneNumber VARCHAR(15),
    createdAt DATETIME DEFAULT NOW(),
    updatedAt DATETIME DEFAULT NOW() ON UPDATE NOW(),
    verified INT DEFAULT 0,
    nameDisplay BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (userId)
);

-- Create table "gallery"
CREATE TABLE IF NOT EXISTS gallery (
    galleryId INT NOT NULL UNIQUE AUTO_INCREMENT,
    userId INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    createdAt DATETIME DEFAULT NOW(),
    updatedAt DATETIME DEFAULT NOW() ON UPDATE NOW(),
    public BOOLEAN DEFAULT FALSE,
    published BOOLEAN DEFAULT FALSE,
    publicId VARCHAR(50),
    coverImage JSON,
    coverText VARCHAR(255),
    coverFont VARCHAR(150),
    PRIMARY KEY (galleryId),
    FOREIGN KEY (userId) REFERENCES users (userId)
);

-- Create table "images"
CREATE TABLE IF NOT EXISTS images (
    imageId INT NOT NULL UNIQUE AUTO_INCREMENT,
    imageUrl VARCHAR(255) UNIQUE NOT NULL,
    userId INT NOT NULL,
    createdAt DATETIME DEFAULT NOW(),
    updatedAt DATETIME DEFAULT NOW() ON UPDATE NOW(),
    fileInfo JSON,
    fileSize INT,
    PRIMARY KEY (imageId),
    FOREIGN KEY (userId) REFERENCES users (userId)
);

-- Create table "accreditations"
CREATE TABLE IF NOT EXISTS accreditations (
    accreditationId INT NOT NULL UNIQUE AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    PRIMARY KEY (accreditationId)
);

-- Create table "gallery_user_accreditations"
CREATE TABLE IF NOT EXISTS gallery_user_accreditations (
    galleryId INT NOT NULL,
    userId INT NOT NULL,
    accreditationId INT NOT NULL,
    PRIMARY KEY (
        galleryId,
        userId,
        accreditationId
    ),
    FOREIGN KEY (galleryId) REFERENCES gallery (galleryId),
    FOREIGN KEY (userId) REFERENCES users (userId),
    FOREIGN KEY (accreditationId) REFERENCES accreditations (accreditationId)
);

-- Create table "image_gallery"
CREATE TABLE IF NOT EXISTS image_gallery (
    imageId INT NOT NULL,
    galleryId INT NOT NULL,
    PRIMARY KEY (imageId, galleryId),
    FOREIGN KEY (imageId) REFERENCES images (imageId),
    FOREIGN KEY (galleryId) REFERENCES gallery (galleryId)
);

CREATE TABLE IF NOT EXISTS admin (
    adminId INT NOT NULL UNIQUE AUTO_INCREMENT,
    userId INT NOT NULL,
    PRIMARY KEY (adminId)
);

CREATE TABLE IF NOT EXISTS otp (
    otpId VARCHAR(36) NOT NULL UNIQUE,
    userId INT NOT NULL,
    otp VARCHAR(6) NOT NULL,
    createdAt DATETIME DEFAULT NOW(),
    sendCount INT DEFAULT 0,
    sendAt DATETIME DEFAULT NOW(),
    PRIMARY KEY (otpId),
    FOREIGN KEY (userId) REFERENCES users (userId)
);

CREATE TABLE IF NOT EXISTS join_gallery_requests (
    requestId INT NOT NULL UNIQUE AUTO_INCREMENT,
    galleryId INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    userId INT,
    createdAt DATETIME DEFAULT NOW(),
    code VARCHAR(6) NOT NULL,
    codeTryCount INT DEFAULT 0,
    phoneNumber VARCHAR(15),
    token VARCHAR(128) UNIQUE NOT NULL,
    FOREIGN KEY (galleryId) REFERENCES gallery (galleryId),
    FOREIGN KEY (userId) REFERENCES users (userId)
);

CREATE TABLE IF NOT EXISTS notifications (
    notificationId INT NOT NULL UNIQUE AUTO_INCREMENT,
    userId INT NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(255),
    type VARCHAR(50),
    isRead BOOLEAN DEFAULT FALSE,
    createdAt DATETIME DEFAULT NOW(),
    PRIMARY KEY (notificationId),
    FOREIGN KEY (userId) REFERENCES users (userId)
);

insert into
    pictures_db.accreditations (
        accreditationId,
        name,
        description
    )
values (
        1,
        'Creator',
        'Can view, edit, manage, and delete'
    ),
    (
        2,
        'invited',
        'invited to gallery'
    ),
    (
        3,
        'waiting',
        'waiting for approval'
    ),
    (4, 'Viewer', 'Can view'),
    (
        5,
        'Editor',
        'Can view and edit'
    ),
    (
        6,
        'Owner',
        'Can view, edit, and manage'
    );
