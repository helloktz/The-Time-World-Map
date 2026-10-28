import { Vector3 } from 'three';
/** Right-handed globe: lon 0 on +X, north on +Y, east toward -Z. */
export function spherePosition(lat: number, lon: number, radius=1): Vector3 {
 const p=lat*Math.PI/180,l=lon*Math.PI/180;
 return new Vector3(radius*Math.cos(p)*Math.cos(l),radius*Math.sin(p),-radius*Math.cos(p)*Math.sin(l));
}
export const cities = [
 ['北京',39.9042,116.4074],['上海',31.2304,121.4737],['广州',23.1291,113.2644],['深圳',22.5431,114.0579],['杭州',30.2741,120.1551],['南京',32.0603,118.7969],['武汉',30.5928,114.3055],['成都',30.5728,104.0668],['重庆',29.563,106.5516],['西安',34.3416,108.9398]
] as const;
export const landforms=[['青藏高原',33,88],['黄土高原',37,108],['云贵高原',25.5,103],['喜马拉雅山脉',28,86],['天山',42,83],['昆仑山脉',36,85],['四川盆地',30.5,105.5],['塔里木盆地',39,82],['华北平原',36,116],['青海湖',36.9,100.2],['鄱阳湖',29.2,116.2],['洞庭湖',29.3,112.9]] as const;
