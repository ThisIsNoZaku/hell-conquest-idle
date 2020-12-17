import {Vector3} from "three";
import {Group, Scene} from "react-three-fiber/components";
import React, {useRef} from "react";
import {useFrame, useLoader} from "react-three-fiber";
import * as THREE from "three";

export default function Background(props) {
    const region = props.region;
    const bg = useRef();
    const far = useRef();
    const mid = useRef();
    const close = useRef();

    const bgTexture = useLoader(THREE.TextureLoader, region.background.background);
    const farTexture = useLoader(THREE.TextureLoader, region.background.far);
    const midTexture = useLoader(THREE.TextureLoader, region.background.mid);
    const closeTexture = useLoader(THREE.TextureLoader, region.background.close);
    const movementScale = .5;
    const scale = [1.76 * 10, 1 * 10, 1];
    useFrame(((state, delta) => {
        if (!props.inactive) {
            far.current.position.x = (far.current.position.x + (movementScale * delta / 10)) % 17;
            mid.current.position.x = (mid.current.position.x + (movementScale * delta / 5 )) % 17;
            close.current.position.x = (close.current.position.x + (movementScale * delta / 2)) % 17;
        }
    }))
    return <React.Fragment>
        <sprite scale={scale} ref={bg} position={new Vector3(0, 0, 0)}>
            <spriteMaterial map={bgTexture}/>
        </sprite>
        <Group ref={far}>
            <sprite scale={scale} ref={far} position={new Vector3(0, 0, 0)}>
                <spriteMaterial map={farTexture}/>
            </sprite>
            <sprite scale={scale} ref={far} position={new Vector3(-17, 0, 0)}>
                <spriteMaterial map={farTexture}/>
            </sprite>
        </Group>
        <Group ref={mid}>
            <sprite scale={scale} position={new Vector3(0, 0, 0)}>
                <spriteMaterial map={midTexture}/>
            </sprite>
            <sprite scale={scale} position={new Vector3(-17, 0, 0)}>
                <spriteMaterial map={midTexture}/>
            </sprite>
        </Group>
        <Group ref={close}>
            <sprite scale={scale} position={new Vector3(0, 0, 0)}>
                <spriteMaterial map={closeTexture}/>
            </sprite>
            <sprite scale={scale} position={new Vector3(-17, 0, 0)}>
                <spriteMaterial map={closeTexture}/>
            </sprite>
        </Group>
    </React.Fragment>
}