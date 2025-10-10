import { generate } from '@ant-design/colors'

export function generateColors(primaryColor) {
  const colors = generate(primaryColor)

  // 更新CSS变量
  const style = document.createElement('style')
  const cssVars =
    colors.reduce((acc, color, index) => {
      return acc + `--ant-primary-${index + 1}: ${color};\n`
    }, ':root {\n') + '}\n'

  style.innerHTML = cssVars
  document.head.appendChild(style)

  return colors
}
