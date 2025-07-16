import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define the path to your file
const filePath = path.join(process.cwd(), 'public', 'editor-content.txt');

export async function GET() {
  try {
    // Read the file and return its content
    const data = fs.readFileSync(filePath, 'utf8');
    return NextResponse.json({ content: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read the file' },
      { status: 500 }
    );
  }
}
