import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ThreeBackground() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const scene    = new THREE.Scene()
    const camera   = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)
    camera.position.z = 5

    const count = 1800
    const geo   = new THREE.BufferGeometry()
    const pos   = new Float32Array(count * 3)
    const col   = new Float32Array(count * 3)
    const palette = [new THREE.Color('#3b82f6'),new THREE.Color('#6366f1'),new THREE.Color('#8b5cf6'),new THREE.Color('#10b981')]
    for (let i = 0; i < count; i++) {
      pos[i*3]=(Math.random()-.5)*20; pos[i*3+1]=(Math.random()-.5)*20; pos[i*3+2]=(Math.random()-.5)*10
      const c=palette[Math.floor(Math.random()*palette.length)]
      col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b
    }
    geo.setAttribute('position',new THREE.BufferAttribute(pos,3))
    geo.setAttribute('color',new THREE.BufferAttribute(col,3))
    const mat = new THREE.PointsMaterial({size:0.05,vertexColors:true,transparent:true,opacity:0.6,sizeAttenuation:true})
    const particles = new THREE.Points(geo,mat)
    scene.add(particles)

    const shapes = []
    const geos = [new THREE.IcosahedronGeometry(0.3,0),new THREE.OctahedronGeometry(0.25,0),new THREE.TetrahedronGeometry(0.28,0)]
    for (let i = 0; i < 6; i++) {
      const m = new THREE.Mesh(geos[i%3], new THREE.MeshBasicMaterial({color:palette[i%4],wireframe:true,transparent:true,opacity:0.22}))
      m.position.set((Math.random()-.5)*10,(Math.random()-.5)*8,(Math.random()-.5)*4)
      m.userData={rx:(Math.random()-.5)*0.01,ry:(Math.random()-.5)*0.012,fs:Math.random()*0.004+0.002,fa:Math.random()*0.3+0.1,iy:m.position.y,ph:Math.random()*Math.PI*2}
      scene.add(m); shapes.push(m)
    }

    let mx=0,my=0
    const onM=(e)=>{mx=(e.clientX/window.innerWidth-.5)*2;my=(e.clientY/window.innerHeight-.5)*2}
    window.addEventListener('mousemove',onM)
    const onR=()=>{camera.aspect=mount.clientWidth/mount.clientHeight;camera.updateProjectionMatrix();renderer.setSize(mount.clientWidth,mount.clientHeight)}
    window.addEventListener('resize',onR)

    let frame; const clock=new THREE.Clock()
    const animate=()=>{
      frame=requestAnimationFrame(animate)
      const t=clock.getElapsedTime()
      particles.rotation.y=t*0.04; particles.rotation.x=t*0.02
      camera.position.x+=(mx*0.5-camera.position.x)*0.05
      camera.position.y+=(-my*0.3-camera.position.y)*0.05
      camera.lookAt(scene.position)
      shapes.forEach(s=>{s.rotation.x+=s.userData.rx;s.rotation.y+=s.userData.ry;s.position.y=s.userData.iy+Math.sin(t*s.userData.fs*100+s.userData.ph)*s.userData.fa})
      renderer.render(scene,camera)
    }
    animate()
    return ()=>{cancelAnimationFrame(frame);window.removeEventListener('mousemove',onM);window.removeEventListener('resize',onR);renderer.dispose();if(mount.contains(renderer.domElement))mount.removeChild(renderer.domElement)}
  }, [])

  return <div ref={mountRef} style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none'}} />
}
