const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class TranslateService {
  constructor() {
    // DeepSeek配置
    this.deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    this.deepseekApiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
    
    // Gemini配置
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.geminiClient = this.geminiApiKey ? new GoogleGenerativeAI(this.geminiApiKey) : null;
    
    // 默认提供商
    this.defaultProvider = process.env.DEFAULT_TRANSLATE_PROVIDER || 'deepseek';
  }

  async translatePrompt(text, targetLanguage = 'zh-CN', provider = null) {
    if (!text || text.trim().length === 0) {
      throw new Error('翻译文本不能为空');
    }

    // 选择提供商
    const selectedProvider = provider || this.defaultProvider;
    
    console.log(`使用翻译提供商: ${selectedProvider}`);

    try {
      switch (selectedProvider) {
        case 'gemini':
          return await this.translateWithGemini(text, targetLanguage);
        case 'deepseek':
          return await this.translateWithDeepSeek(text, targetLanguage);
        default:
          throw new Error(`不支持的翻译提供商: ${selectedProvider}`);
      }
    } catch (error) {
      console.error(`${selectedProvider} 翻译失败:`, error.message);
      
      // 如果当前提供商失败，尝试使用备用提供商
      if (selectedProvider === 'gemini' && this.deepseekApiKey) {
        console.log('尝试使用DeepSeek作为备用...');
        return await this.translateWithDeepSeek(text, targetLanguage);
      } else if (selectedProvider === 'deepseek' && this.geminiApiKey) {
        console.log('尝试使用Gemini作为备用...');
        return await this.translateWithGemini(text, targetLanguage);
      }
      
      throw error;
    }
  }

  async translateWithGemini(text, targetLanguage) {
    if (!this.geminiClient) {
      throw new Error('Gemini API密钥未配置');
    }

    const systemPrompt = this.getSystemPrompt(targetLanguage);
    const userPrompt = `请翻译以下Midjourney提示词，保持专业术语的准确性：\n\n${text}`;
    
    try {
      const model = this.geminiClient.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
      const response = await result.response;
      const translatedText = response.text().trim();
      
      return {
        original: text,
        translated: translatedText,
        language: targetLanguage,
        provider: 'gemini',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Gemini API调用失败:', error.message);
      throw new Error('Gemini翻译服务暂时不可用，请稍后再试');
    }
  }

  async translateWithDeepSeek(text, targetLanguage) {
    if (!this.deepseekApiKey) {
      throw new Error('DeepSeek API密钥未配置');
    }

    const systemPrompt = this.getSystemPrompt(targetLanguage);
    const userPrompt = `请翻译以下Midjourney提示词，保持专业术语的准确性：\n\n${text}`;

    try {
      const response = await axios.post(this.deepseekApiUrl, {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      }, {
        headers: {
          'Authorization': `Bearer ${this.deepseekApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      const translatedText = response.data.choices[0].message.content.trim();
      
      return {
        original: text,
        translated: translatedText,
        language: targetLanguage,
        provider: 'deepseek',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('DeepSeek API调用失败:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        throw new Error('DeepSeek API密钥无效或已过期');
      } else if (error.response?.status === 429) {
        throw new Error('DeepSeek API调用频率超限，请稍后再试');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('DeepSeek翻译服务超时，请稍后再试');
      } else {
        throw new Error('DeepSeek翻译服务暂时不可用，请稍后再试');
      }
    }
  }

  getSystemPrompt(targetLanguage) {
    const prompts = {
      'zh-CN': `你是一个专业的Midjourney提示词翻译专家。请将英文提示词翻译成中文，要求：
1. 保持专业术语的准确性（如：photorealistic, cinematic, octane render等）
2. 保持提示词的结构和顺序
3. 使用简洁明了的中文表达
4. 保留重要的技术参数和风格描述
5. 只返回翻译结果，不要添加解释或其他内容`,
      
      'en-US': `You are a professional Midjourney prompt translator. Please translate the Chinese prompt to English, requirements:
1. Maintain accuracy of professional terms
2. Keep the structure and order of the prompt
3. Use clear and concise English expressions
4. Preserve important technical parameters and style descriptions
5. Only return the translation result, do not add explanations or other content`,
      
      'ja-JP': `あなたはプロのMidjourneyプロンプト翻訳者です。中国語のプロンプトを日本語に翻訳してください。要件：
1. 専門用語の正確性を保持する
2. プロンプトの構造と順序を保持する
3. 明確で簡潔な日本語表現を使用する
4. 重要な技術パラメータとスタイル記述を保持する
5. 翻訳結果のみを返し、説明やその他の内容を追加しない`,
      
      'ko-KR': `당신은 전문 Midjourney 프롬프트 번역가입니다. 중국어 프롬프트를 한국어로 번역해 주세요. 요구사항:
1. 전문 용어의 정확성 유지
2. 프롬프트의 구조와 순서 유지
3. 명확하고 간결한 한국어 표현 사용
4. 중요한 기술 매개변수와 스타일 설명 보존
5. 번역 결과만 반환하고 설명이나 기타 내용을 추가하지 않음`
    };

    return prompts[targetLanguage] || prompts['zh-CN'];
  }

  // 交互式翻译（带词组对应关系）
  async translateWithPhrases(text, targetLanguage = 'zh-CN', provider = null) {
    if (!text || text.trim().length === 0) {
      throw new Error('翻译文本不能为空');
    }

    // 选择提供商
    const selectedProvider = provider || this.defaultProvider;
    
    console.log(`使用翻译提供商（交互式）: ${selectedProvider}`);

    try {
      switch (selectedProvider) {
        case 'gemini':
          return await this.translateWithPhrasesGemini(text, targetLanguage);
        case 'deepseek':
          return await this.translateWithPhrasesDeepSeek(text, targetLanguage);
        default:
          throw new Error(`不支持的翻译提供商: ${selectedProvider}`);
      }
    } catch (error) {
      console.error(`${selectedProvider} 交互式翻译失败:`, error.message);
      
      // 如果当前提供商失败，尝试使用备用提供商
      if (selectedProvider === 'gemini' && this.deepseekApiKey) {
        console.log('尝试使用DeepSeek作为备用...');
        return await this.translateWithPhrasesDeepSeek(text, targetLanguage);
      } else if (selectedProvider === 'deepseek' && this.geminiApiKey) {
        console.log('尝试使用Gemini作为备用...');
        return await this.translateWithPhrasesGemini(text, targetLanguage);
      }
      
      throw error;
    }
  }

  async translateWithPhrasesGemini(text, targetLanguage) {
    if (!this.geminiClient) {
      throw new Error('Gemini API密钥未配置');
    }

    const systemPrompt = this.getInteractiveSystemPrompt(targetLanguage);
    const userPrompt = `请翻译以下Midjourney提示词并提取关键词组对应关系：\n\n${text}`;
    
    try {
      const model = this.geminiClient.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
      const response = await result.response;
      const responseText = response.text().trim();
      
      return this.parseInteractiveResponse(responseText, text);
    } catch (error) {
      console.error('Gemini 交互式翻译失败:', error.message);
      throw new Error('Gemini翻译服务暂时不可用，请稍后再试');
    }
  }

  async translateWithPhrasesDeepSeek(text, targetLanguage) {
    if (!this.deepseekApiKey) {
      throw new Error('DeepSeek API密钥未配置');
    }

    const systemPrompt = this.getInteractiveSystemPrompt(targetLanguage);
    const userPrompt = `请翻译以下Midjourney提示词并提取关键词组对应关系：\n\n${text}`;

    try {
      const response = await axios.post(this.deepseekApiUrl, {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      }, {
        headers: {
          'Authorization': `Bearer ${this.deepseekApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      const responseText = response.data.choices[0].message.content.trim();
      
      return this.parseInteractiveResponse(responseText, text);

    } catch (error) {
      console.error('DeepSeek 交互式翻译失败:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        throw new Error('DeepSeek API密钥无效或已过期');
      } else if (error.response?.status === 429) {
        throw new Error('DeepSeek API调用频率超限，请稍后再试');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('DeepSeek翻译服务超时，请稍后再试');
      } else {
        throw new Error('DeepSeek翻译服务暂时不可用，请稍后再试');
      }
    }
  }

  getInteractiveSystemPrompt(targetLanguage) {
    return `你是一个专业的Midjourney提示词翻译专家。请将英文提示词翻译成中文，并提取2-3个重要的关键词组对应关系。

要求：
1. 翻译要准确、自然
2. 提取2-3个最重要的词组（名词、形容词或短语）
3. 返回JSON格式，包含翻译和词组对应关系

返回格式示例：
{
  "translated": "美丽的樱花在春天盛开",
  "keyPhrases": [
    {
      "en": "beautiful",
      "zh": "美丽的",
      "enStart": 0,
      "enEnd": 9,
      "zhStart": 0,
      "zhEnd": 3
    },
    {
      "en": "sakura blossoms",
      "zh": "樱花",
      "enStart": 10,
      "enEnd": 25,
      "zhStart": 4,
      "zhEnd": 6
    }
  ]
}

注意：
- 只返回JSON，不要其他内容
- 确保位置索引准确
- 选择最有学习价值的词组`;
  }

  parseInteractiveResponse(responseText, originalText) {
    try {
      // 尝试解析JSON响应
      const parsedResponse = JSON.parse(responseText);
      
      if (!parsedResponse.translated || !parsedResponse.keyPhrases) {
        throw new Error('响应格式不正确');
      }

      // 给每个关键词组添加唯一ID
      const keyPhrasesWithId = parsedResponse.keyPhrases.map((phrase, index) => ({
        id: index + 1,
        ...phrase
      }));

      return {
        original: originalText,
        translated: parsedResponse.translated,
        keyPhrases: keyPhrasesWithId,
        language: 'zh-CN',
        provider: this.defaultProvider,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('解析交互式翻译响应失败:', error.message);
      console.error('原始响应:', responseText);
      
      // 如果JSON解析失败，返回基础翻译格式
      return {
        original: originalText,
        translated: responseText,
        keyPhrases: [],
        language: 'zh-CN',
        provider: this.defaultProvider,
        timestamp: new Date().toISOString()
      };
    }
  }

  // 独立的词组分析方法
  async analyzePhrases(originalText, translatedText, targetLanguage = 'zh-CN', provider = null) {
    if (!originalText || originalText.trim().length === 0) {
      throw new Error('原文不能为空');
    }

    if (!translatedText || translatedText.trim().length === 0) {
      throw new Error('译文不能为空');
    }

    // 选择提供商
    const selectedProvider = provider || this.defaultProvider;
    
    console.log(`使用词组分析提供商: ${selectedProvider}`);

    try {
      switch (selectedProvider) {
        case 'gemini':
          return await this.analyzePhrasesGemini(originalText, translatedText, targetLanguage);
        case 'deepseek':
          return await this.analyzePhrasesDeepSeek(originalText, translatedText, targetLanguage);
        default:
          throw new Error(`不支持的翻译提供商: ${selectedProvider}`);
      }
    } catch (error) {
      console.error(`${selectedProvider} 词组分析失败:`, error.message);
      
      // 如果当前提供商失败，尝试使用备用提供商
      if (selectedProvider === 'gemini' && this.deepseekApiKey) {
        console.log('尝试使用DeepSeek作为备用...');
        return await this.analyzePhrasesDeepSeek(originalText, translatedText, targetLanguage);
      } else if (selectedProvider === 'deepseek' && this.geminiApiKey) {
        console.log('尝试使用Gemini作为备用...');
        return await this.analyzePhrasesGemini(originalText, translatedText, targetLanguage);
      }
      
      throw error;
    }
  }

  async analyzePhrasesGemini(originalText, translatedText, targetLanguage) {
    if (!this.geminiClient) {
      throw new Error('Gemini API密钥未配置');
    }

    const systemPrompt = this.getPhraseAnalysisPrompt(targetLanguage);
    const userPrompt = `请分析以下英中文本的词组对应关系：

原文：${originalText}
译文：${translatedText}`;
    
    try {
      const model = this.geminiClient.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
      const response = await result.response;
      const responseText = response.text().trim();
      
      return this.parsePhraseAnalysisResponse(responseText, originalText, translatedText);
    } catch (error) {
      console.error('Gemini 词组分析失败:', error.message);
      throw new Error('Gemini词组分析服务暂时不可用，请稍后再试');
    }
  }

  async analyzePhrasesDeepSeek(originalText, translatedText, targetLanguage) {
    if (!this.deepseekApiKey) {
      throw new Error('DeepSeek API密钥未配置');
    }

    const systemPrompt = this.getPhraseAnalysisPrompt(targetLanguage);
    const userPrompt = `请分析以下英中文本的词组对应关系：

原文：${originalText}
译文：${translatedText}`;

    try {
      const response = await axios.post(this.deepseekApiUrl, {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      }, {
        headers: {
          'Authorization': `Bearer ${this.deepseekApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      const responseText = response.data.choices[0].message.content.trim();
      
      return this.parsePhraseAnalysisResponse(responseText, originalText, translatedText);

    } catch (error) {
      console.error('DeepSeek 词组分析失败:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        throw new Error('DeepSeek API密钥无效或已过期');
      } else if (error.response?.status === 429) {
        throw new Error('DeepSeek API调用频率超限，请稍后再试');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('DeepSeek词组分析服务超时，请稍后再试');
      } else {
        throw new Error('DeepSeek词组分析服务暂时不可用，请稍后再试');
      }
    }
  }

  getPhraseAnalysisPrompt(targetLanguage) {
    return `你是一个专业的英中文本词组对应分析专家。请分析给定的英文原文和中文译文，提取2-3个最重要的词组对应关系。

要求：
1. 提取2-3个最有学习价值的词组（名词、形容词或短语）
2. 确保词组在原文和译文中都存在
3. 返回JSON格式，包含词组对应关系和位置信息

返回格式示例：
{
  "keyPhrases": [
    {
      "en": "beautiful",
      "zh": "美丽的",
      "enStart": 0,
      "enEnd": 9,
      "zhStart": 0,
      "zhEnd": 3
    },
    {
      "en": "sunset",
      "zh": "日落",
      "enStart": 10,
      "enEnd": 16,
      "zhStart": 4,
      "zhEnd": 6
    }
  ]
}

注意：
- 只返回JSON，不要其他内容
- 确保位置索引准确（基于字符位置）
- 选择最有学习价值的词组`;
  }

  parsePhraseAnalysisResponse(responseText, originalText, translatedText) {
    try {
      // 尝试解析JSON响应
      const parsedResponse = JSON.parse(responseText);
      
      if (!parsedResponse.keyPhrases) {
        throw new Error('响应格式不正确');
      }

      // 给每个关键词组添加唯一ID
      const keyPhrasesWithId = parsedResponse.keyPhrases.map((phrase, index) => ({
        id: index + 1,
        ...phrase
      }));

      return {
        original: originalText,
        translated: translatedText,
        keyPhrases: keyPhrasesWithId,
        language: 'zh-CN',
        provider: this.defaultProvider,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('解析词组分析响应失败:', error.message);
      console.error('原始响应:', responseText);
      
      // 如果JSON解析失败，返回空的词组分析结果
      return {
        original: originalText,
        translated: translatedText,
        keyPhrases: [],
        language: 'zh-CN',
        provider: this.defaultProvider,
        timestamp: new Date().toISOString()
      };
    }
  }

  // 批量翻译
  async translateBatch(texts, targetLanguage = 'zh-CN') {
    const results = [];
    
    for (const text of texts) {
      try {
        const result = await this.translatePrompt(text, targetLanguage);
        results.push(result);
      } catch (error) {
        results.push({
          original: text,
          translated: null,
          error: error.message,
          language: targetLanguage,
          timestamp: new Date().toISOString()
        });
      }
      
      // 添加延迟避免API限制
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
  }
}

module.exports = new TranslateService();
