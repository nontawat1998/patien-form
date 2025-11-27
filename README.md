# Patein Form

ระบบนี้เป็นระบบแบบฟอร์มสำหรับกรอกข้อมูลผู้ป่วย พัฒนาด้วยเทคโนโลยีใหม่ ๆ ให้ใช้งานได้ง่ายและทำงานแบบเรียลไทม์ โดยใช้ Next.js ในการทำหน้าเว็บและโครงสร้างหลักของระบบ ส่วนการออกแบบหน้าตาใช้ TailwindCSS

ข้อมูลทั้งหมดจะถูกเก็บและอัปเดตแบบเรียลไทม์ผ่าน Supabase ทำให้ฝั่งผู้ดูแลเห็นข้อมูลที่ผู้ใช้กำลังกรอกอยู่ทันที และตัวระบบก็ถูก Deploy บน Vercel เพื่อให้ใช้งานได้สะดวกและเสถียร

โดยรวมก็คือระบบนี้ช่วยให้ผู้ดูแลเห็นข้อมูลที่ถูกกรอกอยู่สด ๆ ทันทีผ่านหน้าจอ และมี UI ที่ใช้งานง่าย รองรับทุกอุปกรณ์ด้วย Next.js และ TailwindCSS บนแพลตฟอร์ม Vercel ครับ


# Setup Project
## This project use Node version v20.5.0

## Install pnpm if you don't have
npm install -g pnpm

## Install the dependencies
pnpm install

## Copy the .env.example into .env
cp .env.example .env

## Run the database migrations
pnpm run db:push

## Start the app in dev mode
pnpm run dev

# การเข้าใช้งานจะแบ่งเป็นสองส่วน:

ผู้ใช้ทั่วไป: เข้าผ่าน /pateinForm เพื่อกรอกข้อมูลผู้ป่วย

ผู้ดูแลระบบ (Admin): เข้าผ่าน /pateinForm?permission=admin เพื่อติดตามข้อมูลแบบเรียลไทม์