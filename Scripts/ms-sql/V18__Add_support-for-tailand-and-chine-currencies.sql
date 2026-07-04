USE [HomeBudget.Accounting];
GO

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

IF EXISTS (SELECT 1 FROM dbo.ConfigSettings WITH (NOLOCK) WHERE [Key] = @GeneralKey)
BEGIN
    DELETE FROM dbo.ConfigSettings
    WHERE [Key] = @GeneralKey;
END

INSERT INTO dbo.ConfigSettings
            ( [Key], Settings )
     VALUES ( @GeneralKey, @defaultSettings );
GO