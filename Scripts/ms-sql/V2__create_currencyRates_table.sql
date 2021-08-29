USE [HomeBudget]
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CurrencyRates' and xtype='U')
BEGIN
    CREATE TABLE CurrencyRates (
        Id INT PRIMARY KEY IDENTITY (1, 1),
		CurrencyId INT,
        Name NVARCHAR(100),
		Abbreviation NVARCHAR(3),
		Scale FLOAT,
		OfficialRate FLOAT,
		RatePerUnit FLOAT,
		UpdateDate Date
    )
END