import asyncio
import asyncpg

async def test():
    try:
        conn = await asyncpg.connect('postgresql://postgres:1305@localhost:5432/carpinteria_db', ssl=False)
        print('SUCCESS')
        await conn.close()
    except Exception as e:
        print('ERROR:', type(e).__name__, str(e))

asyncio.run(test())
