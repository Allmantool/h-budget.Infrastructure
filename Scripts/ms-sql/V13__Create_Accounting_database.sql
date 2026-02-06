USE master;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.databases
    WHERE name = N'HomeBudget.Accounting'
)
BEGIN
    CREATE DATABASE [HomeBudget.Accounting];
END
GO
