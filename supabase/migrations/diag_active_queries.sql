-- DIAGNOSTIC: Check for long-running or idle-in-transaction queries
SELECT
    pid,
    now() - xact_start AS xact_duration,
    query,
    state
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY xact_start ASC;
