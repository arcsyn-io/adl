import { describe,expect,it } from 'vitest'
import { parseStylesheet,validateStylesheet } from '@adl/stylesheet'

const cases=[
  {name:'valid type and id rules',source:'stylesheet version "1.0" { element type "service" { shape "ellipse" } element id api { x "10px" y "20px" } }',valid:true},
  {name:'invalid paint',source:'stylesheet version "1.0" { element * { fill "red" } }',valid:false},
  {name:'invalid position scope',source:'stylesheet version "1.0" { element type "service" { x "10px" y "20px" } }',valid:false},
] as const
describe('stylesheet conformance',()=>{for(const fixture of cases)it(fixture.name,()=>{const parsed=parseStylesheet(fixture.source);expect(parsed.ok).toBe(true);if(parsed.ok)expect(validateStylesheet(parsed.document).valid).toBe(fixture.valid)})})
