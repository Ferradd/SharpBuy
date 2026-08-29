import fs from 'fs';

// 21 Working accounts
const accounts = [
  // 1. Knife & High-value
  {
    steamId: '76561199222229128',
    category: 'Skins $50-$350',
    details: '★ НОВЫЙ / $50-$350 ИНВЕНТАРЬ (34 скина: Nova Rising Sun, Deagle Serpent Strike, M4A4 Choppa)',
    token: '76561199222229128----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTIyMjIyOTEyOCIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE3OTMzNjkyNjcsICJuYmYiOiAxNzE0MjQ2MjkyLCAiaWF0IjogMTcyMjg4NjI5MiwgImp0aSI6ICIwRjdCXzI0RDMwQzNGX0VBN0VFIiwgIm9hdCI6IDE3MjI4ODYyOTIsICJnZW4iOiA0LCAicGVyIjogMSwgImlwX3N1YmplY3QiOiAiMjEzLjE0Mi45Ny42MSIsICJpcF9jb25maXJtZXIiOiAiMjEzLjE0Mi45Ny42MSIgfQ.EUGCq4QxZQvowVxh5GWVwg6zLiVIeTzS0xXjnc8jjzRlOANB4in9t3fr6ia9_HQScmpdzs-0MQZqto8xeiYrDQ'
  },
  {
    steamId: '76561198308872864',
    category: 'Medals & Items',
    details: '★ НОВЫЙ / 10-YEAR VETERAN COIN + 49 ПРЕДМЕТОВ (Монета 10 лет, Кейсы, Скины)',
    token: '76561198308872864----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5ODMwODg3Mjg2NCIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDA4NjY4NDQsICJuYmYiOiAxNzc0MDEyMDUwLCAiaWF0IjogMTc4MjY1MjA1MCwgImp0aSI6ICIwMDE0XzI4NjRBRUZBX0NGOTUwIiwgIm9hdCI6IDE3ODI2NTIwNTAsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICI4MS4xODQuMTIwLjE5NyIsICJpcF9jb25maXJtZXIiOiAiODEuMTg0LjEyMC4xOTciIH0.tIYZoNBQ0YqjBwF1b4CK3sR0pTRAqo9750eltEMQYNUcfqITy3768BBC1P7XyaO85EeOrlmhfRfTcN4tW6iEDw'
  },
  {
    steamId: '76561199250626158',
    category: 'Knife',
    details: '★ НОЖ Stiletto Knife | Stained (FT) ($165.00) (Order: SHARP-ACC-9874)',
    token: '76561199250626158----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTI1MDYyNjE1OCIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDQ1MDI2NDgsICJuYmYiOiAxNzc3NTc0NzQ0LCAiaWF0IjogMTc4NjIxNDc0NCwgImp0aSI6ICIwMDBDXzI4OUMwQTc1XzQ5M0RFIiwgIm9hdCI6IDE3ODYyMTQ3NDQsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICI3Ny44Ny45OS4xMjQiLCAiaXBfY29uZmlybWVyIjogIjUuMjMxLjQ1LjM0IiB9.zXKAZFGXKgwWaKDN7lAyjT7g-V7V9JwO9lGuXdQM7amDcB5dxeQ3IcsvXkImVw-J1O4phPNYNYRXNWR9iYR1CA'
  },
  {
    steamId: '76561197994572241',
    category: 'Inventory',
    details: 'Инвентарь $10.00+ | CS2 Prime (Order: SHARP-PRIME-8700)',
    token: '76561197994572241----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5Nzk5NDU3MjI0MSIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE3OTQ2OTIxODgsICJuYmYiOiAxNzU0OTA0Mjg2LCAiaWF0IjogMTc2MzU0NDI4NiwgImp0aSI6ICIwMDE3XzI3NDZBMUY5XzRFQ0UwIiwgIm9hdCI6IDE3NjM1NDQyODYsICJnZW4iOiAxLCAicGVyIjogMSwgImlwX3N1YmplY3QiOiAiNzguMTU3LjIzMS4xNTMiLCAiaXBfY29uZmlybWVyIjogIjQ2LjQyLjE0OS4xODgiIH0.x6S82SI7D7skdQhQkkqPttbwKcmzC7aZgvZvp-JxcdbcLjwSw8m_6aqJCzKoUBBieaN_-QPTO7_oPjHPL82RCA'
  },
  {
    steamId: '76561199188317738',
    category: 'Inventory',
    details: 'Инвентарь $10.00+ (3h отлёжка) | CS2 Prime (Order: SHARP-ACC-9869)',
    token: '76561199188317738----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTE4ODMxNzczOCIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDUxMjEwNzksICJuYmYiOiAxNzc4MTU5MDQ3LCAiaWF0IjogMTc4Njc5OTA0NywgImp0aSI6ICIwMDBFXzI4QTU0M0I0X0FCNzg0IiwgIm9hdCI6IDE3ODY3OTkwNDcsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICI0Ni4xNzIuMjIzLjg4IiwgImlwX2NvbmZpcm1lciI6ICI0Ni4xNzIuMjIzLjg4IiB9.cJmOdU3bVGXmyfJ2YVmmoBh8CUdYhMaZYZogsjx8A87cPnHLSy8w_GngfKzFIDzjhWfWQINDNhd_SCfuFUc9Cw'
  },
  {
    steamId: '76561199773433845',
    category: 'Inventory',
    details: 'Инвентарь €6.00+ | CS2 Prime (Order: SHARP-MT7S0C21-517)',
    token: '76561199773433845----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTc3MzQzMzg0NSIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDQ0NDEzODMsICJuYmYiOiAxNzc3NTE4NzIzLCAiaWF0IjogMTc4NjE1ODcyMywgImp0aSI6ICIwMDBDXzI4OUMwQTY4X0U3RjIxIiwgIm9hdCI6IDE3ODYxNTg3MjMsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICIxODUuMTczLjIwNC4zMiIsICJpcF9jb25maXJtZXIiOiAiMTg1LjE3My4yMDQuMzIiIH0.T8XJnxGnAtTk2u867aW63D672c7F0yvmH-NgoWOaUo-w2Rpnd3Xy8b_t-zms7q7S-zIPRcALPZ33lahff10gCQ'
  },
  {
    steamId: '76561198077834073',
    category: 'Inventory',
    details: 'Инвентарь $5.00+ (AK-47 / 13h отлёжка) | CS2 Prime (Order: SHARP-PRIME-8702)',
    token: '76561198077834073----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5ODA3NzgzNDA3MyIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE3OTkwNTUzNjYsICJuYmYiOiAxNzcyMTAzODI0LCAiaWF0IjogMTc4MDc0MzgyNCwgImp0aSI6ICIwMDA0XzI4NDhGQkU1XzQyNENEIiwgIm9hdCI6IDE3ODA3NDM4MjQsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICIxODguMjQzLjE4My4yMTciLCAiaXBfY29uZmlybWVyIjogIjE4OC4yNDMuMTgzLjIxNyIgfQ.zSlLFM0hKi-O6R9IDuJwenHfZOzTRlaAZNYW4R1T6ZbWDkj5b-MHWrZoM3Q84Mwsc_i6-_rway4GfSQZfuGVBA'
  },
  {
    steamId: '76561199151675753',
    category: 'Inventory',
    details: 'Инвентарь $5.00+ | CS2 Prime (Order: SHARP-ACC-9864)',
    token: '76561199151675753----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTE1MTY3NTc1MyIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDE1NzQyNTIsICJuYmYiOiAxNzc0Nzg4MTY0LCAiaWF0IjogMTc4MzQyODE2NCwgImp0aSI6ICIwMDAyXzI4NjRBRkEwX0RGQzYyIiwgIm9hdCI6IDE3ODM0MjgxNjQsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICIzMS4xODUuOS4xMjQiLCAiaXBfY29uZmlybWVyIjogIjMxLjE4NS45LjEyNCIgfQ.CfBcoxpNxrwg2DCzdMI_PnGkhb3EswzZHrtnksGINXja5KvysADX1zPvWRm1ArzcJa-_G7ZiNS39ffYTe8U2BA'
  },
  {
    steamId: '76561199241484983',
    category: 'Inventory',
    details: 'Инвентарь $4.00+ (USP-S / 4 недели отлёжка) | CS2 Prime (Order: SHARP-ACC-9873)',
    token: '76561199241484983----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTI0MTQ4NDk4MyIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE3OTQ1OTYzMjUsICJuYmYiOiAxNzY3NzI2NDg5LCAiaWF0IjogMTc3NjM2NjQ4OSwgImp0aSI6ICIwMDEyXzI4MDlDMUI2XzExMUI4IiwgIm9hdCI6IDE3NzYzNjY0ODksICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICIxNzYuMjEzLjI0Ni44OSIsICJpcF9jb25maXJtZXIiOiAiMTQ2LjEwMy40My41OCIgfQ.d-W7c0ZBPKiR4gvr1NLY6rEMWZ-yFEyh01tApxd1qW5aimaJlDJdyFULEyM0BolgWXEemASp47AxikyyR1KFAw'
  },
  {
    steamId: '76561199231692149',
    category: 'Inventory',
    details: 'Инвентарь <$5 (10,000 часов / 6 дней отлёжка) | CS2 Prime (Order: SHARP-ACC-9872)',
    token: '76561199231692149----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTIzMTY5MjE0OSIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDM3NDYxODIsICJuYmYiOiAxNzc2OTU3NzQ0LCAiaWF0IjogMTc4NTU5Nzc0NCwgImp0aSI6ICIwMDE3XzI4OTJDRkFCXzREODdGIiwgIm9hdCI6IDE3ODU1OTc3NDQsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICIxNDUuMjU1LjMuMTk1IiwgImlwX2NvbmZpcm1lciI6ICIxNDUuMjU1LjMuMTk1IiB9.jqDqXvo58BPWVWNHdj3M9Utv6UjWVGVJL0NnwCkdgla3D96FhVvldN00Ur_35HH-wHQFetCjw98eYr-iuRBiAw'
  },
  {
    steamId: '76561199230983883',
    category: 'Inventory',
    details: 'Инвентарь <$5 (13h отлёжка) | CS2 Prime (Order: SHARP-ACC-9871)',
    token: '76561199230983883----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTIzMDk4Mzg4MyIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDI3NTMzNjYsICJuYmYiOiAxNzc1ODQyNjgyLCAiaWF0IjogMTc4NDQ4MjY4MiwgImp0aSI6ICIwMDAxXzI4ODA1OTVDXzk1MDM2IiwgIm9hdCI6IDE3ODQ0ODI2ODIsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICIxNzMuNDguMTc5LjE4NyIsICJpcF9jb25maXJtZXIiOiAiMTczLjQ4LjE3OS4xODciIH0.TPBuO2jUgr5fEL_ENPgnrI2IxpRyMA9LrjjVETEk1vwMELoUI4xMG1Xp0obGDMUOVFoAcogpIqn9GU9WntLMDA'
  },

  // 2. High Inactivity
  {
    steamId: '76561199492828421',
    category: 'Inactivity',
    details: 'Отлёжка 6 дней | CS2 Premier Ready (Order: SHARP-PREMIER-MT7JJ37R)',
    token: '76561199492828421----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTQ5MjgyODQyMSIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDIyMzIzNTMsICJuYmYiOiAxNzc1NDE0MzY5LCAiaWF0IjogMTc4NDA1NDM2OSwgImp0aSI6ICIwMDA0XzI4NzlDNDkwX0Q4Q0Y1IiwgIm9hdCI6IDE3ODQwNTQzNjksICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICIyMTIuMTY0LjI3LjE5NyIsICJpcF9jb25maXJtZXIiOiAiMTg1LjIzNy4yMjAuMjYiIH0.F0n0EN0ee2D5C26n8XQsMij2oHWqcZL3W8CeA7tflIbqJA8X6bzAVCcoE10k7ifgdJARfQrXhX7NFos75xsTCA'
  },
  {
    steamId: '76561199216635588',
    category: 'Inactivity',
    details: 'Отлёжка 3 часа | CS2 Prime (Order: SHARP-ACC-9870)',
    token: '76561199216635588----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTIxNjYzNTU4OCIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDIzMjAxNjEsICJuYmYiOiAxNzc1NDg4NTExLCAiaWF0IjogMTc4NDEyODUxMSwgImp0aSI6ICIwMDE4XzI4ODA1OTBCX0MwMjlGIiwgIm9hdCI6IDE3ODQxMjg1MTEsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICIxMzQuMTkuMTU1LjE1OCIsICJpcF9jb25maXJtZXIiOiAiMTM0LjE5LjE1NS4xNTgiIH0.8BYxXcDcZa5t9G8sbAQREFv1CyJq-mtwsLnz2E2kzABTskClRJlen6nbseeoUYz5_SGdDtBK7t8G_NRGfUh4AQ'
  },

  // 3. Clean Prime & Premier Ready
  {
    steamId: '76561199787712068',
    category: 'Premier Ready',
    details: 'CS2 Premier Ready (Order: SHARP-MT7SC5WK-564)',
    token: '76561199787712068----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTc4NzcxMjA2OCIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDQwODU0NDEsICJuYmYiOiAxNzc3MTMyNjk3LCAiaWF0IjogMTc4NTc3MjY5NywgImp0aSI6ICIwMDE4XzI4OTJDRkQwX0JCRUZGIiwgIm9hdCI6IDE3ODU3NzI2OTcsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICIxODguMjQyLjE4NS40NyIsICJpcF9jb25maXJtZXIiOiAiMTg4LjI0Mi4xODUuNDciIH0.Rlv2wSGgWCv4eqaNY7zqAU_JVKOMxh5cu5FPyAa0tYtsg-OiqwyCJI2KKDowPufsubmynUu0aDhfuS6w-UttDw'
  },
  {
    steamId: '76561199697754827',
    category: 'Premier Ready',
    details: 'CS2 Premier Ready (Order: SHARP-MT7QH9LV-213)',
    token: '76561199697754827----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTY5Nzc1NDgyNyIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDQ4OTAxOTMsICJuYmYiOiAxNzYzNjgxNDcwLCAiaWF0IjogMTc3MjMyMTQ3MCwgImp0aSI6ICIwMDAxXzI3QzdENjc1X0Y4NDI1IiwgIm9hdCI6IDE3NzIzMjE0NzAsICJnZW4iOiAxLCAicGVyIjogMSwgImlwX3N1YmplY3QiOiAiMTc4LjIzLjE4Ni4xOTAiLCAiaXBfY29uZmlybWVyIjogIjE3OC4yMy4xODYuMTkwIiB9.JqoedesCSzaRBQvduMSpv9BstUaE90SM6rOrGrrHjhwD0VrA0IIZ19h4wxJ45uwFmlCa1YMalaEeU_pGTmq_DQ'
  },
  {
    steamId: '76561199166963438',
    category: 'Premier Ready',
    details: 'CS2 Premier Ready (Order: SHARP-ACC-9862)',
    token: '76561199166963438----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTE2Njk2MzQzOCIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE3OTUzNzg1OTIsICJuYmYiOiAxNzU1NTkwNDUwLCAiaWF0IjogMTc2NDIzMDQ1MCwgImp0aSI6ICIwMDE4XzI3NEZEREEwXzY5MEE2IiwgIm9hdCI6IDE3NjQyMzA0NTAsICJnZW4iOiAxLCAicGVyIjogMSwgImlwX3N1YmplY3QiOiAiMTk1LjY0LjIzOS4xNTciLCAiaXBfY29uZmlybWVyIjogIjE5NS42NC4yMzkuMTU3IiB9.BWN1aAqLU4sQJInUojitiQAhHC-yBw4C5mKdUd5gYQ66s6KiZKLLhO3UIomtREDbggLq4hsXUaRir3-xQX6JCA'
  },
  {
    steamId: '76561199489633318',
    category: 'Premier Ready',
    details: 'CS2 Premier Ready (Order: SHARP-PREMIER-MT7JJ5ES)',
    token: '76561199489633318----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTQ4OTYzMzMxOCIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE3OTgwMzk3NDIsICJuYmYiOiAxNzcxMjM5NzgwLCAiaWF0IjogMTc3OTg3OTc4MCwgImp0aSI6ICIwMDA3XzI4M0ZDMTNBXzlERUFFIiwgIm9hdCI6IDE3Nzk4Nzk3ODAsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICIxMDkuNjguMTEzLjEzMiIsICJpcF9jb25maXJtZXIiOiAiOTQuMTQzLjIzMS40MyIgfQ.-qiujmIdIlb77y67R4pIGfdULiyS-B0D2_yHR_FiSGEjk2wmY5jQLrPdsMUbFvgEUOx7ShJpRMD-nZnnYyI7AA'
  },
  {
    steamId: '76561199501030638',
    category: 'Premier Ready',
    details: 'CS2 Premier Ready (Order: SHARP-PREMIER-MT7JCJIE)',
    token: '76561199501030638----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTUwMTAzMDYzOCIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDUwNDQyMTcsICJuYmYiOiAxNzc4MTg3NTQ3LCAiaWF0IjogMTc4NjgyNzU0NywgImp0aSI6ICIwMDEyXzI4QTZCOUY4X0ZGM0I1IiwgIm9hdCI6IDE3ODY4Mjc1NDcsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICIxNzguMTQxLjI4LjciLCAiaXBfY29uZmlybWVyIjogIjE3OC4xNDEuMjguNyIgfQ.N0or86Jcodk7gbnxGleIlOr1w7WmFJoztu7DR0ROjiIluuBvf8v7ZLZUO203yb29GN6KQNKP99TmoLoM9AMXBQ'
  },
  {
    steamId: '76561199168590117',
    category: 'Premier Ready',
    details: 'CS2 Premier Ready (Order: SHARP-ACC-9861)',
    token: '76561199168590117----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTE2ODU5MDExNyIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDMwMzQ0MzUsICJuYmYiOiAxNzM2Nzc5MDUwLCAiaWF0IjogMTc0NTQxOTA1MCwgImp0aSI6ICIwMDBEXzI2MzFCQkQxXzUzMEYwIiwgIm9hdCI6IDE3NDU0MTkwNTAsICJnZW4iOiAzLCAicGVyIjogMSwgImlwX3N1YmplY3QiOiAiMTQ2LjEyMC4xNzUuMjEwIiwgImlwX2NvbmZpcm1lciI6ICIxNDYuMTIwLjE3NS4yMTAiIH0.jmBv3rst1JTELgAeS5xDZxrKZY5eECqe8ef7gmVk37i39rohp5gApJe_RLHg04r_gMhhwMpKsyCq9Qt1voxPCw'
  },
  {
    steamId: '76561198001838422',
    category: 'Prime Clean',
    details: 'CS2 Prime Account (Order: SHARP-PRIME-8701)',
    token: '76561198001838422----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5ODAwMTgzODQyMiIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDUyMTkzODEsICJuYmYiOiAxNzY1MjAzMjI2LCAiaWF0IjogMTc3Mzg0MzIyNiwgImp0aSI6ICIwMDEwXzI3RTM3NkQxXzY0REJBIiwgIm9hdCI6IDE3NzM4NDMyMjYsICJnZW4iOiAxLCAicGVyIjogMSwgImlwX3N1YmplY3QiOiAiNS4zNS4zNi4zNiIsICJpcF9jb25maXJtZXIiOiAiODIuMjcuMC4yMzgiIH0.Wt9wsDepcI8YiX-59T4uukKaAg963awi1k4TMKPoS8tpZDdMroJ9jIJpMJZd6d3MNd0_LfOSE0tig3Uyx9rIDA'
  },
  {
    steamId: '76561199388981206',
    category: 'Premier Ready',
    details: 'CS2 Premier Ready (Order: SHARP-ACC-9875)',
    token: '76561199388981206----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTM4ODk4MTIwNiIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDUyNTUxODgsICJuYmYiOiAxNzc4MzA4MDU0LCAiaWF0IjogMTc4Njk0ODA1NCwgImp0aSI6ICIwMDEzXzI4QTZCQTExXzU3NEFDIiwgIm9hdCI6IDE3ODY5NDgwNTQsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICI4NS4xNzQuMTgwLjU2IiwgImlwX2NvbmZpcm1lciI6ICIxNjMuNTMuMjQ0LjIwMSIgfQ.Lg6nP1giDda2k6BfO34jIZow_MZ2s9kCnp0Ni6ZIIhMsok9c_mQIyDT0ZFOyKnUHq0JXXuxcNpCiP0ju9Le_Ag'
  }
];

// Let's generate formatted steam.txt
let steamTxtContent = `================================================================================
  SHARPBUY MASTER STEAM ACCOUNTS DATABASE (NFA PRIME & PREMIER)
  Total Working Accounts: 21 | Non-Working Removed: 5 | Last Updated: 2026-08-25
================================================================================

================================================================================
  🏆 [РАЗДЕЛ 1] АККАУНТЫ С ИНВЕНТАРЕМ, НОЖАМИ И РЕДКИМИ МЕДАЛЯМИ (HIGH-VALUE)
================================================================================
`;

accounts.slice(0, 11).forEach((acc, i) => {
  steamTxtContent += `\n--- [${acc.details}] ---
🔗 Профиль Steam: https://steamcommunity.com/profiles/${acc.steamId}/
${acc.token}\n`;
});

steamTxtContent += `\n================================================================================
  ⏳ [РАЗДЕЛ 2] АККАУНТЫ С ДЛИТЕЛЬНОЙ ОТЛЁЖКОЙ (SAFE INACTIVITY)
================================================================================
`;

accounts.slice(11, 13).forEach((acc, i) => {
  steamTxtContent += `\n--- [${acc.details}] ---
🔗 Профиль Steam: https://steamcommunity.com/profiles/${acc.steamId}/
${acc.token}\n`;
});

steamTxtContent += `\n================================================================================
  ⚡ [РАЗДЕЛ 3] ЧИСТЫЕ CS2 PRIME & PREMIER READY АККАУНТЫ
================================================================================
`;

accounts.slice(13).forEach((acc, i) => {
  steamTxtContent += `\n--- [${acc.details}] ---
🔗 Профиль Steam: https://steamcommunity.com/profiles/${acc.steamId}/
${acc.token}\n`;
});

fs.writeFileSync('C:/Users/iliyk/Desktop/steam.txt', steamTxtContent, 'utf8');

// Generate formatted steam_categorized.txt with inventory checker quick links
let categorizedContent = `================================================================================
           SHARPBUY MASTER STEAM ACCOUNTS REPOSITORY (CATEGORIZED)
================================================================================
Total Working Accounts: 21 | Non-Working Removed: 5
Last Updated: 25.08.2026, 20:25:00

--------------------------------------------------------------------------------
[1] ★ KNIFE, HIGH-VALUE SKINS & RARE MEDALS
--------------------------------------------------------------------------------
`;

accounts.slice(0, 11).forEach((acc, i) => {
  categorizedContent += `\n#${i + 1} | ${acc.details}
🔗 Ссылка на Профиль Steam: https://steamcommunity.com/profiles/${acc.steamId}/
🔍 Проверка инвентаря (CSFloat / Steam): https://steamcommunity.com/profiles/${acc.steamId}/inventory/
TOKEN:
${acc.token}\n`;
});

categorizedContent += `\n--------------------------------------------------------------------------------
[2] ⏳ HIGH INACTIVITY & TENURE ACCOUNTS (SAFE)
--------------------------------------------------------------------------------
`;

accounts.slice(11, 13).forEach((acc, i) => {
  categorizedContent += `\n#${i + 12} | ${acc.details}
🔗 Ссылка на Профиль Steam: https://steamcommunity.com/profiles/${acc.steamId}/
🔍 Проверка инвентаря: https://steamcommunity.com/profiles/${acc.steamId}/inventory/
TOKEN:
${acc.token}\n`;
});

categorizedContent += `\n--------------------------------------------------------------------------------
[3] ⚡ CLEAN CS2 PRIME & PREMIER READY ACCOUNTS
--------------------------------------------------------------------------------
`;

accounts.slice(13).forEach((acc, i) => {
  categorizedContent += `\n#${i + 14} | ${acc.details}
🔗 Ссылка на Профиль Steam: https://steamcommunity.com/profiles/${acc.steamId}/
🔍 Проверка инвентаря: https://steamcommunity.com/profiles/${acc.steamId}/inventory/
TOKEN:
${acc.token}\n`;
});

fs.writeFileSync('C:/Users/iliyk/Desktop/steam_categorized.txt', categorizedContent, 'utf8');
console.log('Successfully updated steam.txt and steam_categorized.txt with Steam profile links!');
