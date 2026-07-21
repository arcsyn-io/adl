import {expect,test} from '@playwright/test'
const relationPoint=async(page:import('@playwright/test').Page,id:string)=>page.locator(`[data-relation-hit-id="${id}"]`).evaluate(path=>{const transform=path.getScreenCTM();if(!transform)throw new Error('Relation path is unavailable');const point=path.getPointAtLength(path.getTotalLength()/2);const screen=new DOMPoint(point.x,point.y).matrixTransform(transform);return{x:screen.x,y:screen.y}})
test('selects groups and relations by clicking them', async ({ page }) => {
  await page.goto('/')

  const group = page.getByRole('button', { name: /Grupo Solution boundary/ })
  await group.locator('rect.group').click({ position: { x: 5, y: 5 } })
  await expect(group).toHaveAttribute('data-state', 'selected')

  const relation = page.getByRole('button', { name: /Relação validates every request/ })
  const point = await relationPoint(page, 'calls')
  await page.mouse.click(point.x, point.y)
  await expect(relation).toHaveAttribute('data-state', 'selected')
})
test('clears the selection when clicking an unselected canvas area', async ({ page }) => {
  await page.goto('/')

  const api = page.locator('[data-entity-id="api"]')
  await api.click()
  await expect(api).toHaveAttribute('data-state', 'selected')

  await page.getByRole('img').click({ position: { x: 24, y: 520 } })

  await expect(api).not.toHaveAttribute('data-state', 'selected')
})
test('selects an element by dragging an area on the canvas', async ({ page }) => {
  await page.goto('/')

  const api = page.locator('[data-entity-id="api"]')
  const apiBox = await api.locator('.element').boundingBox()
  expect(apiBox).not.toBeNull()

  await page.mouse.move(apiBox!.x - 8, apiBox!.y - 8)
  await page.mouse.down()
  await page.mouse.move(apiBox!.x + apiBox!.width + 8, apiBox!.y + apiBox!.height + 8)
  const marquee = page.locator('[data-selection-area="true"]')
  await expect(marquee).toBeVisible()
  expect(await marquee.evaluate(element => element.tagName)).toBe('DIV')
  await page.mouse.up()

  await expect(api).toHaveAttribute('data-state', 'selected')
  await expect(page.locator('[data-entity-id="database"]')).not.toHaveAttribute('data-state', 'selected')
  await expect(page.locator('[data-selection-area="true"]')).toHaveCount(0)
})
test('selects groups and relations by dragging areas', async ({ page }) => {
  await page.goto('/')

  const group = page.getByRole('button', { name: /Grupo Solution boundary/ })
  const groupBox = await group.locator('rect.group').boundingBox()
  expect(groupBox).not.toBeNull()
  await page.mouse.move(groupBox!.x + 18, groupBox!.y - 4)
  await page.mouse.down()
  await page.mouse.move(groupBox!.x + 18, groupBox!.y + 24)
  await page.mouse.up()
  await expect(group).toHaveAttribute('data-state', 'selected')

  await page.goto('/')
  const relation = page.getByRole('button', { name: /Relação validates every request/ })
  const point = await relationPoint(page, 'calls')
  await page.mouse.move(point.x, point.y)
  await page.mouse.down()
  await page.mouse.move(point.x + 24, point.y + 24)
  await page.mouse.up()
  await expect(relation).toHaveAttribute('data-state', 'selected')
})
test('renders links with an open chevron arrow',async({page})=>{await page.goto('/');await expect(page.locator('#mdl-arrow path')).toHaveClass(/marker-chevron/)})
test('renders virtual links dashed with an open chevron arrow',async({page})=>{await page.goto('/');const line=page.locator('[data-connector-kind="virtual-link"] .relation');await expect(line).toHaveClass(/relation-virtual-link/);await expect(line).toHaveAttribute('marker-end','url(#mdl-arrow)')})
test('uses a 12 px grid to measure the diagram', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.preview')).toHaveCSS('background-size', '12px 12px, 12px 12px')
})
test('resizes a selected element from a corner handle',async({page})=>{await page.goto('/');const api=page.getByRole('button',{name:/Elemento API/});await api.click();const before=await api.locator('.element').boundingBox();const handle=page.getByRole('slider',{name:'Redimensionar API pelo canto inferior direito'});const handleBox=await handle.boundingBox();expect(before).not.toBeNull();expect(handleBox).not.toBeNull();await page.mouse.move(handleBox!.x+handleBox!.width/2,handleBox!.y+handleBox!.height/2);await page.mouse.down();await page.mouse.move(handleBox!.x+60,handleBox!.y+40);await page.mouse.up();const after=await api.locator('.element').boundingBox();expect(after!.width).toBeGreaterThan(before!.width);expect(after!.height).toBeGreaterThan(before!.height)})
test('resizes an element from a side handle without changing the other dimension', async ({ page }) => {
  await page.goto('/')
  const api = page.getByRole('button', { name: /Elemento API/ })
  await api.click()
  const element = api.locator('.element')
  const before = await element.evaluate(node => {
    const box = (node as SVGGraphicsElement).getBBox()
    return { width: box.width, height: box.height }
  })
  const rightHandle = page.getByRole('slider', { name: 'Redimensionar API pela lateral direita' })
  await expect(page.getByRole('slider', { name: 'Redimensionar API pela lateral superior' })).toBeVisible()
  await expect(page.getByRole('slider', { name: 'Redimensionar API pela lateral inferior' })).toBeVisible()
  await expect(page.getByRole('slider', { name: 'Redimensionar API pela lateral esquerda' })).toBeVisible()
  const handleBox = await rightHandle.boundingBox()
  expect(before).not.toBeNull()
  expect(handleBox).not.toBeNull()
  await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2)
  await page.mouse.down()
  await page.mouse.move(handleBox!.x + 60, handleBox!.y + 40)
  await page.mouse.up()
  const after = await element.evaluate(node => {
    const box = (node as SVGGraphicsElement).getBBox()
    return { width: box.width, height: box.height }
  })
  expect(after.width).toBeGreaterThan(before.width)
  expect(after.height).toBe(before.height)
})
test('resizes an element from any point along its selected border', async ({ page }) => {
  await page.goto('/')
  const api = page.getByRole('button', { name: /Elemento API/ })
  await api.click()
  const element = api.locator('.element')
  const before = await element.evaluate(node => {
    const box = (node as SVGGraphicsElement).getBBox()
    return { width: box.width, height: box.height }
  })
  const rightBorder = api.locator('[data-resize-edge="e"]')
  const borderBox = await rightBorder.boundingBox()
  expect(borderBox).not.toBeNull()
  await page.mouse.move(borderBox!.x + borderBox!.width / 2, borderBox!.y + borderBox!.height * 0.25)
  await page.mouse.down()
  await page.mouse.move(borderBox!.x + 60, borderBox!.y + borderBox!.height * 0.25)
  await page.mouse.up()
  const after = await element.evaluate(node => {
    const box = (node as SVGGraphicsElement).getBBox()
    return { width: box.width, height: box.height }
  })
  expect(after.width).toBeGreaterThan(before.width)
  expect(after.height).toBe(before.height)
})
test('resizes a selected group from a corner handle', async ({ page }) => {
  await page.goto('/')
  const group = page.getByRole('button', { name: /Grupo Solution boundary/ })
  const groupShape = group.locator('rect.group')
  await groupShape.click({ position: { x: 5, y: 5 } })
  const before = await groupShape.evaluate(node => {
    const box = (node as SVGGraphicsElement).getBBox()
    return { width: box.width, height: box.height }
  })
  const handle = page.getByRole('slider', { name: 'Redimensionar Solution boundary pelo canto inferior direito' })
  const handleBox = await handle.boundingBox()
  expect(handleBox).not.toBeNull()
  await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2)
  await page.mouse.down()
  await page.mouse.move(handleBox!.x + 60, handleBox!.y + 40)
  await page.mouse.up()
  const after = await groupShape.evaluate(node => {
    const box = (node as SVGGraphicsElement).getBBox()
    return { width: box.width, height: box.height }
  })
  expect(after.width).toBeGreaterThan(before.width)
  expect(after.height).toBeGreaterThan(before.height)
})
test('shows the group name inside its visual boundary',async({page})=>{await page.goto('/');const group=page.getByRole('button',{name:/Grupo Solution boundary/});await expect(group.locator('text.group-label')).toHaveText('Solution boundary')})
test('edits an existing element label on double click and persists it to ADL', async ({ page }) => {
  await page.goto('/')

  await page.locator('[data-entity-id="api"]').dblclick()
  const editor = page.getByRole('textbox', { name: 'Editar texto de api' })
  await expect(editor).toHaveValue('API')
  await editor.fill('API Gateway')
  await editor.press('Enter')

  await expect(page.locator('[data-entity-id="api"]')).toContainText('API Gateway')
  await page.locator('[role="tab"]#adl-editor-tab').click()
  await expect(page.locator('.cm-content')).toContainText('name "API Gateway"')
})
test('adds text to an unlabeled relation on double click and persists it to ADL', async ({ page }) => {
  await page.goto('/')

  await page.locator('[data-relation-hit-id="extends"]').dblclick()
  const editor = page.getByRole('textbox', { name: 'Editar texto de extends' })
  await expect(editor).toHaveValue('')
  await editor.fill('extends API')
  await editor.press('Enter')

  await expect(page.locator('[data-relation-label-id="extends"]')).toHaveText('extends API')
  await page.locator('[role="tab"]#adl-editor-tab').click()
  await page.locator('.cm-content').click()
  await page.keyboard.press('Control+End')
  await expect(page.locator('.cm-content')).toContainText('name "extends API"')
})
test('expands a group when a member is dragged beyond its boundary',async({page})=>{await page.goto('/');const group=page.getByRole('button',{name:/Grupo Solution boundary/});const api=page.getByRole('button',{name:/Elemento API/});const groupBefore=await group.locator('rect.group').boundingBox();const apiBox=await api.locator('.element').boundingBox();expect(groupBefore).not.toBeNull();expect(apiBox).not.toBeNull();await page.mouse.move(apiBox!.x+apiBox!.width/2,apiBox!.y+apiBox!.height/2);await page.mouse.down();await page.mouse.move(groupBefore!.x+groupBefore!.width+100,apiBox!.y+apiBox!.height/2);await page.mouse.up();const groupAfter=await group.locator('rect.group').boundingBox();expect(groupAfter!.width).toBeGreaterThan(groupBefore!.width)})
test('renders and inspects semantic entities accessibly',async({page})=>{await page.goto('/');await expect(page.getByRole('heading',{name:'Payments Flow'})).toBeVisible();const api=page.getByRole('button',{name:/Elemento API/});await expect(api).toBeVisible();await api.click();await expect(page.getByText(/Selecionado: api/)).toBeVisible();await api.focus();await expect(api).toHaveAttribute('data-state','selected');await expect(page.getByRole('img')).toHaveAttribute('aria-label',/api → database/)})
