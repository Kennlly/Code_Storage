SELECT CAST(CONVERT(CHAR(16), ${columnName}, 20) AS DATETIME) AS [Timestamp], COUNT(*) AS [Count] FROM ${tableName}
WHERE CAST(${columnName} AS DATE) IN ('2022-12-01', '2022-12-01')
GROUP BY CAST(CONVERT(CHAR(16), ${columnName}, 20) AS DATETIME)
ORDER BY Timestamp