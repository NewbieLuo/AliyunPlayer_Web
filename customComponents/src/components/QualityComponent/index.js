import qualityHtml from './index.html'
import qualityModal from './quality-modal.html'
import './index.scss'
import { parseDom } from 'utils'

/**
 * 切换清晰度组件
 */
export default class QualityComponent {
  constructor() {
    this.html = parseDom(qualityHtml)
    this.modalHtml = parseDom(qualityModal)
    this.hasCreated = false
    this.definition = ''
  }

  createEl (el, player) {
    const lang = player._options && player._options.language
    this.isEn = lang && lang === 'en-us'
    this.html.querySelector('.current-quality').innerText = this.isEn ? 'Resolution' : '清晰度'
    this.modalHtml.querySelector('.switchimg').innerText = this.isEn ? 'Switching to you for' : '正在为您切换到'
    this.modalHtml.querySelector('.wait').innerText = this.isEn ? 'Please wait...' : '请稍后...'
    let eleControlbar = el.querySelector('.prism-controlbar')
    eleControlbar.appendChild(this.html)
    el.appendChild(this.modalHtml)
  }

  setCurrentQuality(quality, def) {
    let currentQuality = this.html.querySelector('.current-quality')
    currentQuality.innerText = quality
    currentQuality.dataset.def = def
    this.definition = def

    let qualityListEle = this.html.querySelector('.quality-list')
    let currentEle = qualityListEle.querySelector('.current')
    if (currentEle) {
      currentEle.className = ''
    }
    let li_target = qualityListEle.querySelector(`li[data-def=${def}]`)
    if (li_target) {
      li_target.className = 'current'
    }
  }

  created(player) {
    this._urls = player._urls

    let currentQualityEle = this.html.querySelector('.current-quality')
    let qualityListEle = this.html.querySelector('.quality-list')

    let lis_ele = this._urls.map(url => {
      return `<li data-def="${url.definition}">${url.desc}</li>`
    })
    this.html.querySelector('.quality-list').innerHTML = lis_ele.join('')

    console.log(this.definition)
    if (this.hasCreated == false && this.definition) {
      let li_target = qualityListEle.querySelector(`li[data-def=${this.definition}]`)
      li_target.className = 'current'
    }
    this.hasCreated = true

    let timeId = null
    currentQualityEle.onclick = () => {
      qualityListEle.style.display = 'block'
    }
    currentQualityEle.onmouseleave = () =>{
      timeId = setTimeout(() => {
        qualityListEle.style.display = 'none'
      }, 100);
    }

    qualityListEle.onmouseenter = () => {
      clearTimeout(timeId)
    }
    qualityListEle.onmouseleave = () => {
      qualityListEle.style.display = 'none'
    }

    qualityListEle.onclick = ({target}) => {
      let definition = target.dataset.def
      if (definition) {
        if (target.className !== 'current') {
          let url = this._urls.find(url => url.definition === definition)
          player.loadByUrl(url.Url, player.getCurrentTime(), true, true)          

          this.setCurrentQuality(url.desc, url.definition)

          this.modalHtml.style.display = 'block'
          this.modalHtml.querySelector('span.current-quality-tag').innerText = url.desc
        } 
      }
    }
  }

  ready(player) {
    this.modalHtml.style.display = 'none'
    // 隐藏设置里面的倍速播放
    let settingEle = document.querySelector('.prism-setting-item.prism-setting-quality')
    if (settingEle) {
     settingEle.classList.add('player-hidden')
    }
  }
}
