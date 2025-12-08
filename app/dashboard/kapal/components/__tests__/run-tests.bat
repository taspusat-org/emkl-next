@echo off
REM Test Runner Script for FormKapal Tests
REM This script provides easy commands to run different test suites

echo ========================================
echo   FormKapal Test Runner
echo ========================================
echo.

if "%1"=="" goto help
if "%1"=="all" goto all
if "%1"=="unit" goto unit
if "%1"=="integration" goto integration
if "%1"=="validation" goto validation
if "%1"=="coverage" goto coverage
if "%1"=="watch" goto watch
if "%1"=="help" goto help

:help
echo Usage: run-tests.bat [command]
echo.
echo Available commands:
echo   all          - Run all Kapal tests
echo   unit         - Run unit tests only
echo   integration  - Run integration tests only
echo   validation   - Run validation schema tests only
echo   coverage     - Run all tests with coverage report
echo   watch        - Run tests in watch mode
echo   help         - Show this help message
echo.
echo Examples:
echo   run-tests.bat all
echo   run-tests.bat coverage
echo   run-tests.bat watch
goto end

:all
echo Running all Kapal tests...
echo.
call npm test kapal
goto end

:unit
echo Running unit tests...
echo.
call npm test FormKapal.test.tsx
goto end

:integration
echo Running integration tests...
echo.
call npm test FormKapal.integration.test.tsx
goto end

:validation
echo Running validation schema tests...
echo.
call npm test kapal.validation.test.ts
goto end

:coverage
echo Running all tests with coverage...
echo.
call npm test -- --coverage kapal
echo.
echo Coverage report generated in ./coverage directory
goto end

:watch
echo Running tests in watch mode...
echo Press Ctrl+C to exit watch mode
echo.
call npm test -- --watch kapal
goto end

:end
echo.
echo ========================================
echo   Test execution completed
echo ========================================
