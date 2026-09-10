(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const data = code => window.eval(code);
  const productPane = $('[data-step-pane="1"]');
  const modelPane = $('[data-step-pane="2"]');
  const templatePane = $('[data-step-pane="3"]');
  if (!productPane || !modelPane || !templatePane || window.__templateFlowV4) return;
  window.__templateFlowV4 = true;

  productPane.dataset.stepPane = '2';
  modelPane.dataset.stepPane = '3';
  templatePane.dataset.stepPane = '1';
  ['展示模版','选择商品','数字模特','使用背景','制作与确认'].forEach((name,index) => {
    const step = $(`[data-step-indicator="${index+1}"]`);
    if (step) step.innerHTML = `<i>${index+1}</i>${name}`;
  });
  templatePane.querySelector('.wizard-title p').textContent = '先选择本次视频的展示方式，后续素材将按模版类型匹配';
  productPane.querySelector('h2').textContent = '商品选择与搭配（选填）';
  modelPane.querySelector('.wizard-title p').textContent = '系统仅允许选择与所选模版类型匹配的数字模特。';
  $$('[data-step-jump="4"]').forEach(item => item.dataset.stepJump = '5');
  $$('[data-step-jump="1"]').forEach(item => item.dataset.stepJump = '2');
  const summaryTemplateRow = $('#summaryTemplate')?.closest('.summary-row');
  const summaryProductRow = $('#summaryProductCount')?.closest('.summary-row');
  if (summaryTemplateRow && summaryProductRow) summaryProductRow.parentElement.insertBefore(summaryTemplateRow,summaryProductRow);
  data("pageCopy.create=['制作伴播','先选择展示模版，再配置商品、数字模特和使用背景']");
  if ($('#pageNote')) $('#pageNote').textContent = '先选择展示模版，再配置商品、数字模特和使用背景';

  const isAnimation = model => model?.type === '动画形象';
  const acceptsModel = (template,model) => !template || !model || (template.type === 'IP形象互动' ? isAnimation(model) : !isAnimation(model));
  window.__decorateTemplateFlowChoices = () => {
    const template = data('templates.find(item=>item.id===state.template)');
    $$('#createTemplateGrid .choice-card').forEach(card => {
      const item = data(`templates.find(template=>template.id===${JSON.stringify(card.dataset.choiceId)})`);
      card.querySelector('.choice-tags')?.remove();
      card.querySelector('.template-type-badge')?.remove();
      card.insertAdjacentHTML('afterbegin',`<span class="template-type-badge">${item?.type||'服饰展示'}</span>`);
    });
    $$('#createModelGrid .choice-card').forEach(card => {
      const model = data(`models.find(item=>item.id===${JSON.stringify(card.dataset.choiceId)})`);
      const disabled = !acceptsModel(template,model);
      card.classList.toggle('template-incompatible',disabled);
      card.setAttribute('aria-disabled',String(disabled));
      card.title = disabled ? (template?.type === 'IP形象互动' ? 'IP形象互动模版仅可选择IP动画形象' : '服饰展示模版仅可选择真人模特') : '';
    });
  };
  data('window.__templateFlowRenderBase=renderCreateChoices;renderCreateChoices=function(){window.__templateFlowRenderBase();window.__decorateTemplateFlowChoices()}');
  const decorateAssetTemplates = () => $$('#templateGrid .asset-card').forEach(card => {
    const name = card.querySelector('h3')?.textContent || '';
    const item = data(`templates.find(template=>template.name===${JSON.stringify(name)})`);
    const cover = card.querySelector('.asset-cover-wrap');
    card.querySelector('.choice-tags')?.remove();
    if (item && cover && !cover.querySelector('.template-type-badge')) cover.insertAdjacentHTML('beforeend',`<span class="template-type-badge">${item.type||'服饰展示'}</span>`);
  });
  new MutationObserver(decorateAssetTemplates).observe($('#templateGrid'),{childList:true});

  document.addEventListener('click',event => {
    const modelCard = event.target.closest('#createModelGrid [data-choice-type="model"]');
    if (modelCard?.classList.contains('template-incompatible')) {
      event.preventDefault();event.stopImmediatePropagation();data(`toast(${JSON.stringify(modelCard.title)})`);return;
    }
    const templateCard = event.target.closest('#createTemplateGrid [data-choice-type="template"]');
    if (!templateCard) return;
    const template = data(`templates.find(item=>item.id===${JSON.stringify(templateCard.dataset.choiceId)})`);
    const model = data('models.find(item=>item.id===state.model)');
    if (!acceptsModel(template,model)) data("state.model=''");
  },true);

  $('#nextStep').addEventListener('click',event => {
    event.preventDefault();event.stopImmediatePropagation();
    const step = data('state.step');
    if (step === 1 && !data('state.template')) return data("toast('请选择展示模版')");
    if (step === 2) window.finalizeSingleGroups?.();
    if (step === 3 && !data('state.model')) return data("toast('请选择数字模特')");
    if (step === 4) {
      if (!data('state.background.mode')) return data("toast('请选择使用背景')");
      data('setStep(5)');$('#generateButton').click();return;
    }
    data(`setStep(${step+1})`);
    data('renderSummary()');
  },true);

  const panel1 = $('#templateModal [data-action-panel="1"]');
  const panel2 = $('#templateModal [data-action-panel="2"]');
  panel1.innerHTML = `<div class="field"><label>模版名称</label><input id="actionNameInput" placeholder="请输入展示模版名称"/></div><div class="field"><label>模版类型</label><select id="actionTypeSelect"><option value="服饰展示">服饰展示</option><option value="IP形象互动">IP形象互动</option></select></div><div class="field" id="templateCreateModeField"><label>创建方式</label><div class="template-create-mode"><label><input type="radio" name="templateCreateMode" value="existing" checked/><span><b>已有模版修改</b><small>复用已有模版的生成参数</small></span></label><label><input type="radio" name="templateCreateMode" value="blank"/><span><b>空白创建</b><small>从零配置生成方式</small></span></label></div></div><div class="field template-source-field" id="templateSourceField"><label>选择已有展示模版</label><input id="templateSourceSearch" list="templateSourceOptions" placeholder="搜索并选择展示模版"/><datalist id="templateSourceOptions"></datalist></div>`;
  const ratios = ['自动匹配','1:1','4:3','3:4','16:9','9:16'];
  panel2.innerHTML = `<div class="template-generation-layout"><button type="button" class="method-option active" data-action-method="image" hidden></button><div class="method-panel active" data-action-method-panel="image"><div class="field"><label>参考图（最多 9 张）</label><div class="template-reference-grid" id="templateReferenceGrid"></div><p class="reference-image-note" id="templateReferenceNote"></p></div></div><div class="template-optional-media"><div class="field"><label>参考视频（选填）</label><button type="button" class="template-media-upload" data-template-upload data-demo-upload="参考视频" data-default-text="上传参考视频"><i data-lucide="video"></i><span>上传参考视频</span></button></div><div class="field"><label>参考音频（选填）</label><button type="button" class="template-media-upload" data-template-upload data-demo-upload="动作音频" data-default-text="上传参考音频"><i data-lucide="music"></i><span>上传参考音频</span></button></div></div><div class="field"><label>提示词</label><textarea id="actionPrompt" placeholder="描述角色动作、镜头、节奏和需要保持一致的视觉特征"></textarea></div><div class="field"><label>生成尺寸</label><div class="template-ratio-grid" id="templateRatioGrid">${ratios.map((ratio,index)=>`<button type="button" class="template-ratio-option ${index===0?'active':''}" data-template-ratio="${ratio}"><i class="template-ratio-shape">${ratio==='自动匹配'?'自动':''}</i><span>${ratio}</span></button>`).join('')}</div></div><div class="field"><label>生成时长</label><div class="template-duration-row"><input type="range" id="templateDuration" min="1" max="15" value="5"/><span class="template-duration-value"><b id="templateDurationValue">5</b>秒</span></div></div><div id="colorModeField" hidden><label><input type="radio" name="actionColorMode" value="单搭配" checked/></label></div></div>`;
  $('#analysisResultComposition')?.closest('div')?.setAttribute('hidden','');
  const analysisCopy = $('#actionAnalysisResult p');
  if (analysisCopy) analysisCopy.textContent = '模版已生成，请检查生成效果和触发方式。';
  $('#actionAnalysisResult').innerHTML = '<video id="analysisResultVideo" controls preload="metadata" playsinline src="assets/templates/template-example.mp4" aria-label="展示模版生成示例视频"></video><img id="analysisResultPoster" hidden src="assets/models/host-xiaoqing-half.png" alt=""/><span id="analysisResultName" hidden></span><span id="analysisResultTrigger" hidden></span><span id="analysisResultComposition" hidden></span>';

  const currentType = () => $('#actionTypeSelect').value || '服饰展示';
  const renderSources = () => {
    const items = data('templates').filter(item => (item.type||'服饰展示') === currentType());
    $('#templateSourceOptions').innerHTML = items.map(item=>`<option value="${item.name}"></option>`).join('');
    if (!items.some(item=>item.name===$('#templateSourceSearch').value)) $('#templateSourceSearch').value = items[0]?.name || '';
  };
  const referenceLabels = () => currentType() === '服饰展示' ? ['模特图','服饰搭配正面图','服饰搭配反面图'] : ['IP形象图'];
  const referenceCardMarkup = ({position,label='',required=false,uploaded=false,token=''}) => `<div class="template-reference-slot ${required?'required':''} ${required?'':'reference-sortable'} ${uploaded?'uploaded':''}" data-reference-image="${position}" data-reference-token="${uploaded?token:''}" data-uploaded="${uploaded}" draggable="${!required&&uploaded}" ${!required&&uploaded?'title="拖动调整参考图顺序"':''}><button type="button" class="template-reference-upload" data-template-upload data-demo-upload="参考图" data-uploaded="${uploaded}" data-default-text="参考图${position}${label?` · ${label}`:''}"><i data-lucide="${uploaded?'check':'image-plus'}"></i><b>参考图${position}${label?` · ${label}`:''}</b><small>${required?'必填':'选填'}</small></button>${uploaded?'<button type="button" class="template-reference-remove" data-remove-reference title="删除参考图" aria-label="删除参考图"><i data-lucide="x"></i></button>':''}</div>`;
  const renumberOptionalReferences = () => {
    const required = referenceLabels().length;
    $$('#templateReferenceGrid .reference-sortable').forEach((slot,index)=>{const position=required+index+1;slot.dataset.referenceImage=String(position);const upload=slot.querySelector('.template-reference-upload');if(upload){upload.dataset.defaultText=`参考图${position}`;upload.querySelector('b').textContent=`参考图${position}`}});
  };
  const syncReferenceAddTile = () => {
    const grid=$('#templateReferenceGrid'),count=$$('[data-reference-image]').length;grid.querySelector('[data-add-reference]')?.remove();
    if(count<9)grid.insertAdjacentHTML('beforeend','<button type="button" class="template-reference-slot template-reference-add" data-add-reference><i data-lucide="image-plus"></i><b>添加参考图</b><small>选填</small></button>');
    window.lucide?.createIcons();
  };
  const renderReferences = (uploadedCount, uploadedPositions=[], referenceOrder=[]) => {
    const fashion = currentType() === '服饰展示';
    const labels = referenceLabels();
    const required = labels.length;
    const uploadedSet = uploadedPositions.length ? new Set(uploadedPositions.map(Number)) : null;
    const requiredMarkup=labels.map((label,index)=>{const position=index+1,uploaded=uploadedSet?uploadedSet.has(position):position<=uploadedCount;return referenceCardMarkup({position,label,required:true,uploaded,token:uploaded?(referenceOrder[index]||`reference-${position}`):''})}).join('');
    const optionalPositions=uploadedSet?[...uploadedSet].filter(position=>position>required).sort((a,b)=>a-b):Array.from({length:Math.max(0,uploadedCount-required)},(_,index)=>required+index+1);
    const optionalMarkup=optionalPositions.slice(0,9-required).map((position,index)=>referenceCardMarkup({position:required+index+1,uploaded:true,token:referenceOrder[position-1]||`reference-${position}`})).join('');
    $('#templateReferenceGrid').innerHTML=requiredMarkup+optionalMarkup;
    syncReferenceAddTile();
    $('#templateReferenceNote').textContent = '请勿上传场景图，展示模版的生成示例统一使用室内白色场景';
    window.lucide?.createIcons();
  };
  const setReferenceSlotState = (slot,uploaded,token='') => {
    slot.dataset.uploaded=String(uploaded);slot.dataset.referenceToken=uploaded?(token||slot.dataset.referenceToken||`reference-${Date.now()}`):'';
    slot.classList.toggle('uploaded',uploaded);slot.draggable=slot.classList.contains('reference-sortable')&&uploaded;
    if(slot.draggable)slot.title='拖动调整参考图顺序';else slot.removeAttribute('title');
    const upload=slot.querySelector('.template-reference-upload');if(upload)upload.dataset.uploaded=String(uploaded);
    const icon=upload?.querySelector('svg,[data-lucide]');if(icon)icon.outerHTML=`<i data-lucide="${uploaded?'check':'image-plus'}"></i>`;
    slot.querySelector('[data-remove-reference]')?.remove();
    if(uploaded)slot.insertAdjacentHTML('beforeend','<button type="button" class="template-reference-remove" data-remove-reference title="删除参考图" aria-label="删除参考图"><i data-lucide="x"></i></button>');
  };
  let draggedReferenceSlot=null;
  $('#templateReferenceGrid').addEventListener('dragstart',event=>{const slot=event.target.closest('.reference-sortable[data-uploaded="true"]');if(!slot){event.preventDefault();return}draggedReferenceSlot=slot;event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',slot.dataset.referenceImage);requestAnimationFrame(()=>slot.classList.add('reference-dragging'))});
  $('#templateReferenceGrid').addEventListener('dragover',event=>{const target=event.target.closest('.reference-sortable');if(!draggedReferenceSlot||!target||target===draggedReferenceSlot)return;event.preventDefault();event.dataTransfer.dropEffect='move';$$('#templateReferenceGrid .reference-drop-target').forEach(slot=>slot.classList.remove('reference-drop-target'));target.classList.add('reference-drop-target')});
  $('#templateReferenceGrid').addEventListener('drop',event=>{const target=event.target.closest('.reference-sortable');if(!draggedReferenceSlot||!target||target===draggedReferenceSlot)return;event.preventDefault();const source=draggedReferenceSlot,sourceNext=source.nextElementSibling;if(sourceNext===target)target.after(source);else target.before(source);renumberOptionalReferences();$$('#templateReferenceGrid .reference-drop-target,.reference-dragging').forEach(slot=>slot.classList.remove('reference-drop-target','reference-dragging'));draggedReferenceSlot=null;window.lucide?.createIcons();data("toast('参考图顺序已调整')")});
  $('#templateReferenceGrid').addEventListener('dragend',()=>{$$('#templateReferenceGrid .reference-drop-target,.reference-dragging').forEach(slot=>slot.classList.remove('reference-drop-target','reference-dragging'));draggedReferenceSlot=null});
  $('#templateReferenceGrid').addEventListener('click',event=>{const remove=event.target.closest('[data-remove-reference]');if(remove){event.preventDefault();event.stopPropagation();const slot=remove.closest('[data-reference-image]');if(slot.classList.contains('required'))setReferenceSlotState(slot,false);else{slot.remove();renumberOptionalReferences();syncReferenceAddTile()}window.lucide?.createIcons();data("toast('参考图已删除')");return}const add=event.target.closest('[data-add-reference]');if(!add)return;event.preventDefault();const required=referenceLabels().length,count=$$('[data-reference-image]').length;if(count>=9)return;add.insertAdjacentHTML('beforebegin',referenceCardMarkup({position:required+$$('#templateReferenceGrid .reference-sortable').length+1,uploaded:true,token:`reference-${Date.now()}`}));syncReferenceAddTile();data("toast('参考图已上传')")});
  const setCreateMode = () => {$('#templateSourceField').hidden = $('#templateCreateModeField').hidden || $('[name="templateCreateMode"]:checked').value !== 'existing'};
  const resetMedia = () => $$('.template-media-upload[data-template-upload]').forEach(button=>{const video=button.dataset.demoUpload==='参考视频';button.dataset.uploaded='false';button.classList.remove('uploaded');button.innerHTML=`<i data-lucide="${video?'video':'music'}"></i><span>${video?'上传参考视频':'上传参考音频'}</span>`});
  const clearGeneration = () => {renderReferences(0);resetMedia();$('#actionPrompt').value='';$$('.template-ratio-option').forEach((item,index)=>item.classList.toggle('active',index===0));$('#templateDuration').value='5';$('#templateDurationValue').textContent='5';window.lucide?.createIcons()};
  const prefill = template => {
    clearGeneration();
    const minimum = currentType()==='服饰展示'?3:1;renderReferences(Math.max(minimum,template?.referenceCount||minimum),template?.referencePositions||[],template?.referenceOrder||[]);
    $('#actionPrompt').value=template?.prompt||'';
    const videoButton=$('[data-template-upload][data-demo-upload="参考视频"]');
    const audioButton=$('[data-template-upload][data-demo-upload="动作音频"]');
    if(videoButton&&(template?.referenceVideo||template?.referenceVideoUrl)){videoButton.dataset.uploaded='true';videoButton.classList.add('uploaded');videoButton.innerHTML='<i data-lucide="check"></i><span>参考视频已上传</span>'}
    if(audioButton&&(template?.referenceAudioUrl||(template?.audio&&template.audio!=='无音频'))){audioButton.dataset.uploaded='true';audioButton.classList.add('uploaded');audioButton.innerHTML='<i data-lucide="check"></i><span>参考音频已上传</span>'}
    const ratio=ratios.includes(template?.generationSize)?template.generationSize:'自动匹配';$$('.template-ratio-option').forEach(item=>item.classList.toggle('active',item.dataset.templateRatio===ratio));
    $('#templateDuration').value=template?.duration||5;$('#templateDurationValue').textContent=$('#templateDuration').value;
  };
  $('#actionTypeSelect').addEventListener('change',()=>{renderSources();renderReferences(0);setCreateMode()});
  $$('[name="templateCreateMode"]').forEach(input=>input.addEventListener('change',setCreateMode));
  $('#templateDuration').addEventListener('input',event=>$('#templateDurationValue').textContent=event.target.value);
  $('#templateRatioGrid').addEventListener('click',event=>{const button=event.target.closest('[data-template-ratio]');if(button)$$('.template-ratio-option').forEach(item=>item.classList.toggle('active',item===button))});
  $('#templateModal').addEventListener('click',event=>{const upload=event.target.closest('[data-template-upload]');if(!upload)return;event.preventDefault();event.stopPropagation();const referenceSlot=upload.closest('[data-reference-image]');if(referenceSlot){setReferenceSlotState(referenceSlot,true);window.lucide?.createIcons();return}upload.dataset.uploaded='true';upload.classList.add('uploaded');const icon=upload.querySelector('[data-lucide],svg');if(icon)icon.outerHTML='<i data-lucide="check"></i>';window.lucide?.createIcons()},true);
  $('#actionNext').addEventListener('click',()=>{if (!panel1.classList.contains('active')) return;if($('[name="templateCreateMode"]:checked').value==='existing'){const source=data(`templates.find(item=>item.name===${JSON.stringify($('#templateSourceSearch').value)})`);prefill(source)}else clearGeneration()},true);
  $('#actionCreate').addEventListener('click',()=>{const required=currentType()==='服饰展示'?3:1;$$('[data-reference-image]').slice(0,required).forEach(slot=>setReferenceSlotState(slot,true));if(!$('#actionPrompt').value.trim())$('#actionPrompt').value=currentType()==='IP形象互动'?'保持IP形象、配色和画风一致，面向镜头完成自然连贯的直播互动动作。':'真人模特自然站立并完整展示服饰搭配，动作自然，镜头稳定。';window.lucide?.createIcons()},true);
  let demoAudioUrl = '';
  const createDemoAudioUrl = () => {
    if (demoAudioUrl) return demoAudioUrl;
    const sampleRate=8000,duration=.6,samples=Math.floor(sampleRate*duration),buffer=new ArrayBuffer(44+samples*2),view=new DataView(buffer);
    const write=(offset,text)=>[...text].forEach((char,index)=>view.setUint8(offset+index,char.charCodeAt(0)));
    write(0,'RIFF');view.setUint32(4,36+samples*2,true);write(8,'WAVE');write(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,sampleRate,true);view.setUint32(28,sampleRate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);write(36,'data');view.setUint32(40,samples*2,true);
    for(let index=0;index<samples;index++){const fade=Math.min(1,index/240,(samples-index)/240),value=Math.sin(2*Math.PI*440*index/sampleRate)*.2*fade;view.setInt16(44+index*2,value*32767,true)}
    demoAudioUrl=URL.createObjectURL(new Blob([buffer],{type:'audio/wav'}));return demoAudioUrl;
  };
  $('#actionCreate').addEventListener('click',()=>{const type=currentType(),referenceSlots=$$('[data-reference-image]'),uploadedSlots=referenceSlots.filter(slot=>slot.dataset.uploaded==='true'),count=uploadedSlots.length,referencePositions=uploadedSlots.map(slot=>Number(slot.dataset.referenceImage)),referenceOrder=referenceSlots.map(slot=>slot.dataset.referenceToken||''),size=$('.template-ratio-option.active')?.dataset.templateRatio||'自动匹配',duration=Number($('#templateDuration').value),hasVideo=$('[data-template-upload][data-demo-upload="参考视频"]')?.dataset.uploaded==='true',hasAudio=$('[data-template-upload][data-demo-upload="动作音频"]')?.dataset.uploaded==='true',image=type==='IP形象互动'?'assets/models/qiaohu/action.png':'assets/models/host-xiaoqing-half.png',referencePool=type==='IP形象互动'?['assets/models/qiaohu/face.png','assets/models/qiaohu/front.png','assets/models/qiaohu/action.png','assets/models/qiaohu/flower.png']:['assets/models/host-xiaoqing-half.png','assets/products/butterfly-set-white-01.webp','assets/products/butterfly-set-detail-01.jpeg','assets/products/butterfly-set-model-02.webp'],referenceImages=Array.from({length:count},(_,index)=>referencePool[index%referencePool.length]),referenceVideoUrl=hasVideo?(type==='IP形象互动'?'assets/models/qiaohu/character-reference.mp4':'assets/templates/template-example.mp4'):'',referenceAudioUrl=hasAudio?createDemoAudioUrl():'';setTimeout(()=>data(`if(pendingTemplate){pendingTemplate.type=${JSON.stringify(type)};pendingTemplate.method='多素材生成';pendingTemplate.referenceCount=${count};pendingTemplate.referencePositions=${JSON.stringify(referencePositions)};pendingTemplate.referenceOrder=${JSON.stringify(referenceOrder)};pendingTemplate.referenceImages=${JSON.stringify(referenceImages)};pendingTemplate.referenceVideo=${hasVideo};pendingTemplate.referenceVideoUrl=${JSON.stringify(referenceVideoUrl)};pendingTemplate.referenceAudioUrl=${JSON.stringify(referenceAudioUrl)};pendingTemplate.source=${JSON.stringify('参考图：已上传 '+count+' 张')};pendingTemplate.generationSize=${JSON.stringify(size)};pendingTemplate.duration=${duration};pendingTemplate.colorMode='';pendingTemplate.image=${JSON.stringify(image)}}`),0)});
  document.addEventListener('click',event=>{if(!event.target.closest('[data-modal="templateModal"]'))return;setTimeout(()=>{$('#templateCreateModeField').hidden=false;$('[name="templateCreateMode"][value="existing"]').checked=true;$('[name="templateCreateMode"][value="blank"]').checked=false;renderSources();renderReferences(0);setCreateMode();resetMedia();window.lucide?.createIcons()},0)});
  document.addEventListener('click',event=>{const edit=event.target.closest('[data-edit-asset="template"]');if(!edit)return;const template=data(`templates.find(item=>item.id===${JSON.stringify(edit.dataset.editId)})`);if(!template)return;setTimeout(()=>{$('#templateCreateModeField').hidden=true;$('#actionTypeSelect').value=template.type||'服饰展示';renderSources();prefill(template);setCreateMode();data('toggleTemplateGenerationEditLock(true)');window.lucide?.createIcons()},0)});
  const templateReferenceImages = template => template.referenceImages?.length ? template.referenceImages : (template.type==='IP形象互动'?['assets/models/qiaohu/face.png']:['assets/models/host-xiaoqing-half.png','assets/products/butterfly-set-white-01.webp','assets/products/butterfly-set-detail-01.jpeg']).slice(0,template.referenceCount||0);
  const templateMediaMarkup = template => {
    const images=templateReferenceImages(template),videoUrl=template.referenceVideoUrl||'',audioUrl=template.referenceAudioUrl||'';
    if(!images.length&&!videoUrl&&!audioUrl)return'';
    return `<section class="detail-section template-reference-section"><h3>参考素材</h3>${images.length?`<div class="template-detail-images">${images.map((src,index)=>`<button type="button" data-preview="${src}" data-preview-title="${template.name} · 参考图${index+1}"><img src="${src}" alt="参考图${index+1}"/><span>参考图${index+1}</span></button>`).join('')}</div>`:''}${videoUrl?`<div class="template-detail-media"><div class="template-detail-media-head"><b>参考视频</b><a class="btn" href="${videoUrl}" download><i data-lucide="download"></i>下载</a></div><video src="${videoUrl}" controls preload="metadata" playsinline></video></div>`:''}${audioUrl?`<div class="template-detail-media audio"><div class="template-detail-media-head"><b>参考音频</b><a class="btn" href="${audioUrl}" download="${template.name}-参考音频.wav"><i data-lucide="download"></i>下载</a></div><audio src="${audioUrl}" controls preload="metadata"></audio></div>`:''}</section>`;
  };
  document.addEventListener('click',event=>{const detail=event.target.closest('[data-detail-type="template"]');if(!detail)return;setTimeout(()=>{const template=data(`templates.find(item=>item.id===${JSON.stringify(detail.dataset.detailId)})`);if(!template)return;$('#drawerBody').innerHTML=`<img class="preview-media" src="${template.image}" alt="${template.name}"/><section class="detail-section" style="margin-top:18px"><h3>模版信息</h3><div class="detail-info"><div><span>模版名称</span><b>${template.name}</b></div><div><span>模版类型</span><b>${template.type||'服饰展示'}</b></div><div><span>创建信息</span><b>${template.creator} · ${template.created}</b></div></div></section>${templateMediaMarkup(template)}<section class="detail-section"><h3>生成参数</h3><div class="detail-info"><div><span>提示词</span><b>${template.prompt||'-'}</b></div><div><span>生成尺寸</span><b>${template.generationSize||'自动匹配'}</b></div><div><span>生成时长</span><b>${template.duration||5} 秒</b></div></div></section><section class="detail-section"><h3>触发方式</h3><div class="detail-info"><div><span>触发方式</span><b>${template.trigger}</b></div><div><span>触发配置</span><b>${template.triggerDetail||'-'}</b></div></div></section>`;window.lucide?.createIcons()},0)},true);

  const backgroundRatioField = $('.background-ratio-grid')?.closest('.field');
  if (backgroundRatioField) backgroundRatioField.hidden = true;
  const backgroundAreaLabel = $('#backgroundCanvas')?.closest('.field')?.querySelector('label');
  if (backgroundAreaLabel && !$('#backgroundTemplateRatio')) backgroundAreaLabel.insertAdjacentHTML('beforeend','<span class="background-template-ratio" id="backgroundTemplateRatio"></span>');
  const syncBackgroundRatio = () => {
    const template = data('templates.find(item=>item.id===state.template)');
    const ratio = template?.generationSize || '自动匹配';
    const ratioLabel = $('#backgroundTemplateRatio');
    if (ratioLabel) ratioLabel.textContent = `视频比例 ${ratio}`;
    const control = $(`[data-background-ratio="${ratio==='自动匹配'?'9:16':ratio}"]`);
    control?.click();
  };
  document.addEventListener('click',event=>{if(event.target.closest('#nextStep')&&data('state.step')===3)setTimeout(syncBackgroundRatio,0);if(event.target.closest('#createBackgroundButton,#editBackgroundButton'))setTimeout(syncBackgroundRatio,0)},true);
  data("plannedVideoCount=function(){return state.template?generationSources().length:0};window.__templateFlowSummaryBase=renderSummary;renderSummary=function(){window.__templateFlowSummaryBase();const hasProducts=(window.compositionSkuInstances?window.compositionSkuInstances():selectedSkuSources()).length>0;$('#summaryGroupCount').textContent=state.step===2?'搭配中':hasProducts?generationSources().length+' 个':'未选择'}");

  window.__decorateTemplateFlowChoices();decorateAssetTemplates();renderSources();renderReferences(0);setCreateMode();data('renderCreateChoices();renderAssets();renderSummary();setStep(1)');
})();
