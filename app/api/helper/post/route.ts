import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define the path to your file
const filePath = path.join(process.cwd(), 'public', 'editor-content.txt');

export async function POST(req: Request) {
  try {
    const { content } = await req.json(); // Read the JSON body

    // Write to the file
    fs.writeFileSync(filePath, content, 'utf8');
    return NextResponse.json({ message: 'File updated successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to write to the file' },
      { status: 500 }
    );
  }
}
