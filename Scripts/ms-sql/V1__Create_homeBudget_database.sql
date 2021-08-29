IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = 'HomeBudget')
BEGIN
    CREATE DATABASE [HomeBudget]
END

GO