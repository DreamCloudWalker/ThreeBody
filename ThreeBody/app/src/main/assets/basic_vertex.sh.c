uniform mat4 mMatrix;          // 总变换矩阵
uniform mat4 mCurrMatrix;
attribute vec3 aPosition;      // 顶点位置
attribute vec2 aTexCoords;     // 纹理坐标
attribute vec4 aColor;         // 顶点颜色

varying vec2 vTexCoords;
varying vec4 vColor;           // 用于传递给片元着色器的颜色

uniform vec3 uCamera;
// 神说：要有光
uniform vec3 uLightLocation;   // 光源位置
uniform vec3 uLightDirection;
attribute vec3 aNormal;
varying vec4 vAmbient;         // 环境光
varying vec4 vDiffuse;
varying vec4 vSpecular;

// 阴影
uniform int needShadow;
uniform mat4 mViewProjMatrix;  // 投影、摄像机组合矩阵

void directionalLight (
    in vec3 normal,
    inout vec4 ambient,     // 环境光最终强度
    inout vec4 diffuse,     // 散射光最终强度
    inout vec4 specular,    // 镜面光最终强度
    in vec3 lightDirection, // 光方向
    in vec4 lightAmbient,
    in vec4 lightDiffuse,
    in vec4 lightSpecular)
{
    ambient = lightAmbient;
    vec3 normalTarget = aPosition + normal; // 计算变化后的法向量
    vec3 newNormal = (mCurrMatrix * vec4(normalTarget, 1)).xyz - (mCurrMatrix * vec4(aPosition, 1)).xyz;
    newNormal = normalize(newNormal);
    // 计算从表面点到摄像机的向量
    vec3 eye = normalize(uCamera - (mCurrMatrix * vec4(aPosition, 1)).xyz);
    // 计算从表面点到光源位置的向量vp
    vec3 vp = normalize(lightDirection);

    vec3 halfVector = normalize(vp + eye);  // 求视线与光线的半向量
    float shininess = 50.0; // 粗糙度，越小越光滑

    float nDotViewPosition = max(0.0, dot(newNormal, vp));  // 法向量与vp点积与0的最大值

    diffuse = lightDiffuse * nDotViewPosition;  // 计算散射光的最终强度
    float nDotViewHalfVector = dot(newNormal, halfVector);  // 法线与半向量的点积
    float powerFactor = max(0.0, pow(nDotViewHalfVector, shininess));   // 镜面反射光强度因子
    specular = lightSpecular * powerFactor;
}

void pointLight (
    in vec3 normal,
    inout vec4 ambient,     // 环境光最终强度
    inout vec4 diffuse,     // 散射光最终强度
    inout vec4 specular,    // 镜面光最终强度
    in vec3 lightLocation,  // 光源位置
    in vec4 lightAmbient,
    in vec4 lightDiffuse,
    in vec4 lightSpecular)
{
    ambient = lightAmbient;
    vec3 normalTarget = aPosition + normal; // 计算变化后的法向量
    vec3 newNormal = (mCurrMatrix * vec4(normalTarget, 1)).xyz - (mCurrMatrix * vec4(aPosition, 1)).xyz;
    newNormal = normalize(newNormal);
    // 计算从表面点到摄像机的向量
    vec3 eye = normalize(uCamera - (mCurrMatrix * vec4(aPosition, 1)).xyz);
    // 计算从表面点到光源位置的向量vp
    vec3 vp = normalize(lightLocation - (mCurrMatrix * vec4(aPosition, 1)).xyz);
    vp = normalize(vp);

    vec3 halfVector = normalize(vp + eye);  // 求视线与光线的半向量
    float shininess = 50.0; // 粗糙度，越小越光滑

    float nDotViewPosition = max(0.0, dot(newNormal, vp));  // 法向量与vp点积与0的最大值

    diffuse = lightDiffuse * nDotViewPosition;  // 计算散射光的最终强度
    float nDotViewHalfVector = dot(newNormal, halfVector);  // 法线与半向量的点积
    float powerFactor = max(0.0, pow(nDotViewHalfVector, shininess));   // 镜面反射光强度因子
    specular = lightSpecular * powerFactor;
}

void main()
{
    if (needShadow == 1) {
        // 绘制本影，计算阴影顶点位置
        vec3 A = vec3(0.0, 0.1, 0.0);   // 投影平面上任一点坐标
        vec3 n = vec3(0.0, 1.0, 0.0);   // 投影平面法向量
        vec3 S = uLightLocation;     // 光源位置
        vec3 V = (mCurrMatrix * vec4(aPosition,1)).xyz;  // 经过平移和旋转变换后的点的坐标
        vec3 VL = -S + (V + S) * (dot(n,(A + S)) / dot(n,(V + S)));  // 求得的投影点坐标
        gl_Position = mViewProjMatrix * vec4(VL,1); // 根据总变换矩阵计算此次绘制此顶点位置
    } else {
        gl_Position = mMatrix * vec4(aPosition, 1); // 根据总变换矩阵计算此次绘制此顶点位置
    }

    pointLight(normalize(aNormal), vAmbient, vDiffuse, vSpecular, uLightLocation,
        vec4(0.15, 0.15, 0.15, 1.0), vec4(0.8, 0.8, 0.8, 1.0), vec4(0.7, 0.7, 0.7, 1.0));

    vTexCoords = aTexCoords;   // 将接收的纹理坐标传递给片元着色器
    vColor = aColor;
}