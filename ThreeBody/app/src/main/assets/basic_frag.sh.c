precision mediump float;

uniform sampler2D uTexture; // 纹理内容
varying vec2 vTexCoords;

varying vec4 vColor;        // 接收从顶点着色器过来的颜色
// 神说：要有光
varying vec4 vAmbient;
varying vec4 vDiffuse;
varying vec4 vSpecular;

uniform highp int needShadow;			// 阴影绘制标志

void main()
{
    if (needShadow == 1) {
        gl_FragColor = vec4(0.1, 0.1, 0.1, 0.9); // 片元最终颜色为阴影的颜色
    } else {
        vec4 finalColor = texture2D(uTexture, vTexCoords);
        gl_FragColor = finalColor * vAmbient + finalColor * vDiffuse + finalColor * vSpecular;
    }
}