USE master;
GO

IF NOT EXISTS(SELECT * FROM sys.databases WITH (NOLOCK) WHERE name = N'HomeBudget')
BEGIN
    CREATE DATABASE [HomeBudget];
END

GO