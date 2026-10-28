import json,pathlib,hashlib
import sys
root=pathlib.Path(__file__).resolve().parents[1];assets=root/'assets'
raw=pathlib.Path(sys.argv[1]) if len(sys.argv)>1 else root/'data-raw'
def coords(x):
 if isinstance(x,list) and len(x)>1 and isinstance(x[0],(float,int)):yield x
 elif isinstance(x,list):
  for y in x:yield from coords(y)
def rounded(x):
 if isinstance(x,list) and len(x)>1 and isinstance(x[0],(float,int)):return [round(y,5) for y in x]
 return [rounded(y) for y in x]
def save(name,features):
 out={'type':'FeatureCollection','features':features};p=assets/name;p.write_text(json.dumps(out,ensure_ascii=False,separators=(',',':'))); print(name,len(features),p.stat().st_size)
zh=['海南','台湾','广西','福建','云南','贵州','江西','湖南','浙江','上海','重庆','湖北','四川','安徽','江苏','河南','西藏','山东','青海','宁夏','陕西','天津','山西','北京','甘肃','河北','辽宁','吉林','新疆','内蒙古','黑龙江','澳门','香港','广东']
d=json.load(open(raw/'provinces.json'));out=[]
for f,z in zip(d['features'],zh):
 p=f['properties'];n=p['shapeName'];n='Guangdong Province' if n=='Guangzhou Province' else n
 f['properties']={'name':n,'nameZh':z,'sourceId':p['shapeID'],'year':2019};f['geometry']['coordinates']=rounded(f['geometry']['coordinates']);out.append(f)
save('provinces.json',out)
for original,name in [('ne_10m_rivers_lake_centerlines','rivers.json'),('ne_10m_lakes','lakes.json')]:
 d=json.load(open(raw/(original+'.json')));out=[]
 for f in d['features']:
  if not f['geometry']:continue
  pts=list(coords(f['geometry']['coordinates']))
  # regional context; retain entire geometries intersecting the China-centered rectangle, not sovereign classification
  if not any(70<=p[0]<=140 and 15<=p[1]<=56 for p in pts):continue
  p=f['properties'];f['properties']={'name':p.get('name') or 'Unnamed','nameZh':p.get('name_zh') or '', 'sourceId':p.get('ne_id')};f['geometry']['coordinates']=rounded(f['geometry']['coordinates']);out.append(f)
 save(name,out)
