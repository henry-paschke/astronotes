# AstroNotes

A KHE 2026 project by James Gaboriault-Whitcomb and Henry Paschke

## Purpose

This project is a full stack cloud application, utilizing a real-time graph-based audio analysis pipeline, used to create study tools for students.

## Stack + APIs

### Backend

- FastAPI
- SQLModel

### Frontend

- React
- Next.js

### Cloud & Deployment

- Azure App services
- Azure postgresql DB
- Redis

## Problems and challenges

FastAPI was a little tricky to debug, Next.js was excellent as usual for frontend, we tried to use AssemblyAI for transcription, but it was too slow for our purposes. Redis was a little tricky because it was the first time either one of us had used it. We used SQLmodel for our ORM, which was a bit difficult to setup the relationships between tables with.
