USE master;

ALTER DATABASE tempdb
    MODIFY FILE (NAME = 'tempdev', SIZE = 8GB);

ALTER DATABASE tempdb
    MODIFY FILE (NAME = 'templog', SIZE = 4GB);

DECLARE @i INT = 2;

WHILE @i <= 4
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM tempdb.sys.database_files
        WHERE name = CONCAT('tempdev', @i)
    )
    BEGIN
        DECLARE @sql NVARCHAR(MAX) =
            CONCAT(
                'ALTER DATABASE tempdb ADD FILE (',
                'NAME = ''tempdev', @i, ''', ',
                'FILENAME = ''/var/opt/mssql/tempdb/tempdev', @i, '.ndf'', ',
                'SIZE = 2GB, ',
                'FILEGROWTH = 512MB)'
            );

        EXEC (@sql);
    END;

    SET @i += 1;
END;

EXEC sys.sp_configure 'show advanced options', 1;
RECONFIGURE;

EXEC sys.sp_configure 'cost threshold for parallelism', 50;
EXEC sys.sp_configure 'max degree of parallelism', 4;
RECONFIGURE;
