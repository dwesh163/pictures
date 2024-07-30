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
    createdAt DATETIME DEFAULT NOW(),
    updatedAt DATETIME DEFAULT NOW() ON UPDATE NOW(),
    verified BOOLEAN DEFAULT FALSE,
    nameDisplay BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (userId)
);

-- Create table "gallery"
CREATE TABLE IF NOT EXISTS gallery (
    galleryId INT NOT NULL UNIQUE AUTO_INCREMENT,
    userId INT NOT NULL,
    createdAt DATETIME DEFAULT NOW(),
    updatedAt DATETIME DEFAULT NOW() ON UPDATE NOW(),
    PRIMARY KEY (galleryId),
    FOREIGN KEY (userId) REFERENCES users (userId)
);

-- Create table "images"
CREATE TABLE IF NOT EXISTS images (
    imageId INT NOT NULL UNIQUE AUTO_INCREMENT,
    imageUrl VARCHAR(255) NOT NULL,
    userId INT NOT NULL,
    createdAt DATETIME DEFAULT NOW(),
    updatedAt DATETIME DEFAULT NOW() ON UPDATE NOW(),
    PRIMARY KEY (imageId),
    FOREIGN KEY (userId) REFERENCES users (userId)
);

-- Create table "accreditations"
CREATE TABLE IF NOT EXISTS accreditations (
    accreditationId INT NOT NULL UNIQUE AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
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
