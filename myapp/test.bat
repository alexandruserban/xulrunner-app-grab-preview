@ECHO OFF

FOR /L %%i IN (1,1,%1) DO (
  ECHO %%i
 start /B cmd.exe /C xulrunner application.ini -purgecaches -url %2 -width 1200 -height 1000 -time %%i
)
	