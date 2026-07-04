USE [HomeBudget.CurrencyRates];
GO

SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @GeneralKey AS NVARCHAR(15) = N'General';

    DECLARE @defaultSettings AS NVARCHAR(MAX) = 
        N'{' +
            N'"ActiveNationalBankCurrencies" :' +
                N'[' +
                    N'{"Abbreviation":"USD", "Id":431, "Name": "US Dollar", "Scale": 1},' +
                    N'{"Abbreviation":"RUB", "Id":456, "Name": "Russian Ruble", "Scale": 100},' +
                    N'{"Abbreviation":"EUR", "Id":451, "Name": "Euro", "Scale": 1},' +
                    N'{"Abbreviation":"UAH", "Id":449, "Name": "Hryvnia", "Scale": 100},' +
                    N'{"Abbreviation":"PLN", "Id":452, "Name": "Zloty", "Scale": 10},' +
                    N'{"Abbreviation":"TRY", "Id":460, "Name": "Turkish Lira", "Scale": 10},' +
                    N'{"Abbreviation":"CNY", "Id":462, "Name": "Yuan Renminbi", "Scale": 10},' +
                    N'{"Abbreviation":"THB", "Id":468, "Name": "Baht", "Scale": 100}' +
                N']' +
        N'}';

    IF ISJSON(@defaultSettings) <> 1
    BEGIN
        THROW 51000, 'Invalid General ConfigSettings JSON.', 1;
    END;

    DELETE FROM dbo.ConfigSettings
    WHERE [Key] = @GeneralKey;

    INSERT INTO dbo.ConfigSettings ([Key], Settings)
    VALUES (@GeneralKey, @defaultSettings);

    INSERT INTO dbo.CurrencyAbbreviations ([CurrencyId], [Name], [Abbreviation])
    SELECT V.CurrencyId, V.[Name], V.Abbreviation
    FROM
    (
        VALUES
            (462, N'Китайский юань', N'CNY'),
            (468, N'Таиландский бат', N'THB')
    ) AS V([CurrencyId], [Name], [Abbreviation])
    WHERE NOT EXISTS
    (
        SELECT 1
        FROM dbo.CurrencyAbbreviations AS CA
        WHERE CA.CurrencyId = V.CurrencyId
    );

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
    BEGIN
        ROLLBACK TRANSACTION;
    END;

    THROW;
END CATCH;
GO