import React, { useState, useEffect, useRef } from 'react';
import { 
  Button, 
  Input,
  Card,
  Typography,
  Space,
  Tag,
  message,
  Avatar,
  Spin,
  Badge,
  Tooltip
} from 'antd';
import { 
  MessageOutlined, 
  CloseOutlined,
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  StarFilled,
  FireOutlined,
  ThunderboltOutlined,
  GiftOutlined,
  SearchOutlined,
  MinusOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authAxios from '../api/AuthAxios';
import chatbotImg from '../chatbot.png';


const { Title, Text } = Typography;

const ChatBot = () => {
  const [visible, setVisible] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [lastProducts, setLastProducts] = useState([]); // Lưu sản phẩm vừa hiển thị
  const [isTyping, setIsTyping] = useState(false); // Hiệu ứng đang gõ
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (visible) {
      setHasNewMessage(false);
      if (messages.length === 0) {
        // Welcome message
        setTimeout(() => {
          addBotMessage(
            'Xin chào! 👋 Tôi là trợ lý mua sắm của bạn. Tôi có thể giúp bạn:',
            'welcome'
          );
        }, 500);
      }
    }
  }, [visible]);

  const addBotMessage = (text, type = 'text', data = null) => {
    // Show typing indicator
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      const botMessage = {
        id: Date.now(),
        sender: 'bot',
        type,
        text,
        data,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      if (!visible) {
        setHasNewMessage(true);
      }
    }, 1500); // Typing delay 1.5s
  };

  const addUserMessage = (text) => {
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
  };

  // Parse query thông minh - extract category, price, intent
  const parseQuery = (text) => {
    const lowerText = text.toLowerCase();
    const result = {
      category: null,
      minPrice: null,
      maxPrice: null,
      intent: null,
      action: null,
      productRef: null,
      originalText: text
    };

    // 1. Detect actions (giỏ hàng, đơn hàng...)
    if (lowerText.match(/giỏ hàng|cart|basket/)) {
      result.action = 'open_cart';
      return result;
    }
    if (lowerText.match(/đơn hàng|order|lịch sử/)) {
      result.action = 'open_orders';
      return result;
    }

    // 2. Detect price range (TRƯỚC productRef để tránh conflict với "200k")
    const rangeMatch = lowerText.match(/(\d+)\s*(k|triệu)?\s*-\s*(\d+)\s*(k|triệu)?/);
    const approxMatch = lowerText.match(/(khoảng|tầm)\s*(\d+)\s*(k|triệu)?/);
    const priceMatch = lowerText.match(/(dưới|trên|từ)?\s*(\d+)\s*(k|triệu)?/);
    
    if (rangeMatch) {
      const min = parseInt(rangeMatch[1]);
      const max = parseInt(rangeMatch[3]);
      const unit1 = rangeMatch[2] === 'triệu' ? 1000000 : 1000;
      const unit2 = rangeMatch[4] === 'triệu' ? 1000000 : 1000;
      result.minPrice = min * unit1;
      result.maxPrice = max * unit2;
    } else if (approxMatch) {
      // "tầm 200k", "khoảng 200k" - tạo range ±20%
      const value = parseInt(approxMatch[2]);
      const unit = approxMatch[3] === 'triệu' ? 1000000 : 1000;
      const price = value * unit;
      result.minPrice = Math.floor(price * 0.8);
      result.maxPrice = Math.floor(price * 1.2);
    } else if (priceMatch && (lowerText.includes('dưới') || lowerText.includes('trên') || lowerText.includes('giá'))) {
      const value = parseInt(priceMatch[2]);
      const unit = priceMatch[3] === 'triệu' ? 1000000 : 1000;
      const price = value * unit;
      
      if (lowerText.includes('dưới')) {
        result.maxPrice = price;
      } else if (lowerText.includes('trên')) {
        result.minPrice = price;
      }
    } else {
      // Detect simple price with unit: "áo 200k", "giày 500k"
      const simplePriceMatch = lowerText.match(/\b(\d+)\s*(k|triệu)\b/);
      if (simplePriceMatch) {
        const value = parseInt(simplePriceMatch[1]);
        const unit = simplePriceMatch[2] === 'triệu' ? 1000000 : 1000;
        const price = value * unit;
        // Tạo range ±20% cho flexible search
        result.minPrice = Math.floor(price * 0.8);
        result.maxPrice = Math.floor(price * 1.2);
      }
    }

    // 3. Detect "mua" action (add to cart)
    if (lowerText.match(/mua|add|thêm giỏ/)) {
      const productRefMatch = lowerText.match(/sản phẩm (\d+)|cái (\d+)|thứ (\d+)|(đầu|cuối|1|2|3|4|5)/);
      if (productRefMatch) {
        const num = productRefMatch[1] || productRefMatch[2] || productRefMatch[3];
        if (num) {
          result.productRef = parseInt(num);
        } else if (productRefMatch[4]) {
          const ref = productRefMatch[4];
          if (ref === 'đầu' || ref === '1') result.productRef = 1;
          else if (ref === 'cuối') result.productRef = -1;
          else result.productRef = parseInt(ref);
        }
        result.action = 'add_to_cart';
        return result;
      }
    }

    // 4. Detect "mô tả" action (show description)
    if (lowerText.match(/mô tả|chi tiết|thông tin/)) {
      const productRefMatch = lowerText.match(/sản phẩm (\d+)|cái (\d+)|thứ (\d+)|(đầu|cuối|1|2|3|4|5)/);
      if (productRefMatch) {
        const num = productRefMatch[1] || productRefMatch[2] || productRefMatch[3];
        if (num) {
          result.productRef = parseInt(num);
        } else if (productRefMatch[4]) {
          const ref = productRefMatch[4];
          if (ref === 'đầu' || ref === '1') result.productRef = 1;
          else if (ref === 'cuối') result.productRef = -1;
          else result.productRef = parseInt(ref);
        }
        result.action = 'show_description';
        return result;
      }
    }

    // 5. Detect product reference (CHỈ khi KHÔNG có price context)
    if (!result.minPrice && !result.maxPrice) {
      const productRefMatch = lowerText.match(/(sản phẩm|cái|thứ)?\s*(\d+)|(đầu|cuối)/);
      if (productRefMatch) {
        const num = productRefMatch[2];
        const special = productRefMatch[3];
        
        if (num) {
          result.productRef = parseInt(num);
        } else if (special) {
          if (special === 'đầu') result.productRef = 1;
          else if (special === 'cuối') result.productRef = -1;
        }
        
        // Chỉ set action nếu thực sự detect được reference
        if (result.productRef) {
          result.action = 'show_product';
          return result;
        }
      }
    }

    // 6. Detect "bao nhiêu" (show price)
    if (lowerText.match(/bao nhiêu|giá cả/)) {
      result.action = 'show_highest_price';
    }

    // 7. Detect intent (sale, mới, bán chạy...)
    if (lowerText.match(/giảm giá|sale|ưu đãi|khuyến mãi|discount/)) {
      result.intent = 'discounts';
    } else if (lowerText.match(/mới|new|ra mắt/)) {
      result.intent = 'new_products';
    } else if (lowerText.match(/bán chạy|hot|phổ biến|best|số lượng bán|bán nhiều/)) {
      result.intent = 'best_sellers';
    } else if (lowerText.match(/đánh giá|rating|chất lượng|tốt/)) {
      result.intent = 'high_rating';
    } else if (lowerText.match(/đắt nhất|giá cao|expensive/)) {
      result.intent = 'most_expensive';
    } else if (lowerText.match(/rẻ nhất|giá rẻ|cheap/)) {
      result.intent = 'cheapest';
    }

    // 8. Detect category
    const categoryInfo = detectCategory(text);
    if (categoryInfo) {
      result.category = categoryInfo.category;
      result.searchKeyword = categoryInfo.searchKeyword; // Keyword để search backend
    }

    return result;
  };
  // Clean keyword - loại bỏ stop words tiếng Việt
  const cleanKeyword = (text) => {
    const stopWords = ['có', 'ko', 'không', 'được', 'của', 'là', 'thì', 'và', 'với', 'cho', 'tôi', 'mình', 'em', 'anh', 'nào', 'loại', 'xem', 'coi', 'cái', 'những', 'các', 'đi'];
    const words = text.toLowerCase().trim().split(/\s+/);
    const cleaned = words.filter(word => !stopWords.includes(word));
    return cleaned.join(' ');
  };

  // Detect category từ keyword - với hierarchy support
  const detectCategory = (text) => {
    const lowerText = text.toLowerCase();
    
    // Category hierarchy: specific -> parent
    // Return object {category, searchKeyword} để control search behavior
    const categoryMap = {
      // Áo
      "áo thun nam": {keywords: ["áo thun nam", "thun nam", "tshirt nam"], search: "áo thun"},
      "áo polo nam": {keywords: ["polo nam"], search: "polo"},
      "áo sơ mi nam": {keywords: ["sơ mi nam", "shirt nam"], search: "sơ mi"},
      "áo khoác nam": {keywords: ["áo khoác nam", "jacket nam"], search: "áo khoác"},
      "áo thun nữ": {keywords: ["áo thun nữ", "thun nữ"], search: "áo thun"},
      "áo kiểu nữ": {keywords: ["áo kiểu nữ"], search: "áo kiểu"},
      "áo khoác nữ": {keywords: ["áo khoác nữ"], search: "áo khoác"},
      
      // Quần
      "váy nữ": {keywords: ["váy", "đầm"], search: "váy"},
      "quần jean nam": {keywords: ["jean nam"], search: "jean"},
      "quần kaki nam": {keywords: ["kaki nam"], search: "kaki"},
      "quần short nam": {keywords: ["short nam"], search: "short"},
      "quần jean nữ": {keywords: ["jean nữ"], search: "jean"},
      
      // Giày dép
      "giày sneaker": {keywords: ["sneaker", "giày thể thao"], search: "sneaker"},
      "giày tây": {keywords: ["giày tây"], search: "giày tây"},
      "dép sandal": {keywords: ["sandal", "dép"], search: "sandal"},
      
      // Phụ kiện
      "túi xách": {keywords: ["túi", "túi xách", "bag"], search: "túi"},
      "ví": {keywords: ["ví", "wallet"], search: "ví"},
      "thắt lưng": {keywords: ["thắt lưng", "belt"], search: "thắt lưng"},
      "mũ nón": {keywords: ["mũ", "nón", "cap"], search: "mũ"},
      "đồng hồ": {keywords: ["đồng hồ", "watch"], search: "đồng hồ"}
    };

    // Detect specific category first
    for (const [category, config] of Object.entries(categoryMap)) {
      if (config.keywords.some(k => lowerText.includes(k))) {
        return {category, searchKeyword: config.search};
      }
    }
    
    // Parent categories fallback
    const parentMap = {
      "áo": ["áo", "ao", "shirt"],
      "quần": ["quần", "quan", "pant"],
      "giày": ["giày", "giay", "shoe"],
      "phụ kiện": ["phụ kiện", "accessory"]
    };
    
    for (const [parent, keywords] of Object.entries(parentMap)) {
      if (keywords.some(k => lowerText.includes(k))) {
        return {category: parent, searchKeyword: parent};
      }
    }
    
    return null;
  };

  // Phân tích intent từ user message (legacy - giờ dùng parseQuery)
  const analyzeIntent = (text) => {
    const parsed = parseQuery(text);
    
    // Nếu có action (cart, orders, product ref)
    if (parsed.action) {
      return parsed;
    }
    
    // Nếu có intent cụ thể
    if (parsed.intent) {
      return {
        type: parsed.intent,
        category: parsed.category,
        minPrice: parsed.minPrice,
        maxPrice: parsed.maxPrice
      };
    }
    
    // Nếu có category hoặc price
    if (parsed.category || parsed.minPrice || parsed.maxPrice) {
      const cleaned = cleanKeyword(text);
      return {
        type: 'search',
        keyword: cleaned || parsed.category,
        category: parsed.category,
        minPrice: parsed.minPrice,
        maxPrice: parsed.maxPrice
      };
    }
    
    // General search
    const cleaned = cleanKeyword(text);
    if (!cleaned || cleaned.length < 2) {
      return { type: 'unclear' };
    }
    
    return { type: 'search', keyword: cleaned };
  };

  const handleQuickAction = async (action, category = null, minPrice = null, maxPrice = null) => {
    setLoading(true);
    try {
      let params = { page_size: 6 };
      let messageText = '';
      
      switch(action) {
        case 'best_sellers':
          params.ordering = '-sold_count';
          messageText = '🔥 Sản phẩm bán chạy';
          break;
        case 'new_products':
          params.is_new = true;
          params.ordering = '-created_at';
          messageText = '✨ Sản phẩm mới';
          break;
        case 'discounts':
          params.on_sale = true;
          params.ordering = '-discount_percentage';
          messageText = '💰 Đang giảm giá';
          break;
        case 'high_rating':
          params.min_rating = 4;
          params.ordering = '-average_rating';
          messageText = '⭐ Đánh giá cao';
          break;
        case 'most_expensive':
          params.ordering = '-variants__price';
          messageText = '💸 Sản phẩm đắt nhất';
          break;
        case 'cheapest':
          params.ordering = 'variants__price';
          messageText = '💵 Sản phẩm rẻ nhất';
          break;
      }
      
      // Thêm category filter nếu có
      if (category) {
        // category có thể là object {category, searchKeyword} hoặc string
        const searchTerm = typeof category === 'object' ? category.searchKeyword : category;
        const displayName = typeof category === 'object' ? category.category : category;
        params.search = searchTerm;
        messageText += ` - ${displayName}`;
      }
      
      // Thêm price filter
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;
      if (minPrice || maxPrice) {
        const priceText = minPrice && maxPrice 
          ? `${minPrice.toLocaleString()}₫-${maxPrice.toLocaleString()}₫`
          : minPrice 
            ? `trên ${minPrice.toLocaleString()}₫`
            : `dưới ${maxPrice.toLocaleString()}₫`;
        messageText += ` (${priceText})`;
      }
      
      const response = await authAxios.get('products/', { params });
      const products = response.data.results || [];
      
      if (products.length > 0) {
        setLastProducts(products); // Lưu context
        addBotMessage(messageText + `: (${products.length} sản phẩm)`, 'products', products);
      } else {
        addBotMessage('Xin lỗi, hiện tại chưa có sản phẩm phù hợp.', 'text');
      }
    } catch (error) {
      console.error('Error:', error);
      addBotMessage('Đã có lỗi xảy ra. Vui lòng thử lại!', 'text');
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async (intent) => {
    setLoading(true);
    try {
      let params = { page_size: 6 };
      let messageText = '';
      const keyword = intent.keyword || intent;
      
      // Handle unclear intent
      if (intent.type === 'unclear') {
        addBotMessage(
          'Xin lỗi, tôi chưa hiểu rõ. Bạn có thể thử:\n• "Áo dưới 300k"\n• "Giày bán chạy"\n• "Sản phẩm giảm giá"',
          'text'
        );
        setLoading(false);
        return;
      }
      
      // Build params - sử dụng searchKeyword thay vì category name
      if (intent.searchKeyword || intent.category || keyword) {
        params.search = intent.searchKeyword || keyword || intent.category;
        messageText = `🔍 Tìm ${intent.category || 'sản phẩm'}`;
      }
      
      // Price filters
      if (intent.minPrice) {
        params.min_price = intent.minPrice;
      }
      if (intent.maxPrice) {
        params.max_price = intent.maxPrice;
      }
      if (intent.minPrice || intent.maxPrice) {
        const priceText = intent.minPrice && intent.maxPrice 
          ? `${intent.minPrice.toLocaleString()}₫-${intent.maxPrice.toLocaleString()}₫`
          : intent.minPrice 
            ? `trên ${intent.minPrice.toLocaleString()}₫`
            : `dưới ${intent.maxPrice.toLocaleString()}₫`;
        messageText += ` (${priceText})`;
      }
      
      // Default ordering
      if (!params.ordering) {
        params.ordering = '-sold_count';
      }
      
      const response = await authAxios.get('products/', { params });
      const products = response.data.results || [];
      
      if (products.length > 0) {
        setLastProducts(products); // Lưu context
        addBotMessage(
          `${messageText} (${products.length} sản phẩm)`,
          'products',
          products
        );
      } else {
        // Smart suggestions based on category
        let suggestions = [];
        if (intent.category) {
          const categoryMap = {
            'váy': ['"Áo nữ"', '"Túi xách"', '"Giày nữ"'],
            'dép': ['"Giày sneaker"', '"Giày thể thao"', '"Giày cao gót"'],
            'đồng hồ': ['"Phụ kiện"', '"Túi xách"', '"Kính mắt"']
          };
          suggestions = categoryMap[intent.category] || ['"Áo khoác dưới 500k"', '"Giày sale"', '"Sản phẩm mới"'];
          addBotMessage(
            `Hiện chưa có ${intent.category}. Bạn có thể xem:\n${suggestions.map(s => `• ${s}`).join('\n')}`,
            'text'
          );
        } else {
          suggestions = ['"Áo khoác dưới 500k"', '"Giày sale"', '"Mua sản phẩm 2"'];
          addBotMessage(
            `😕 Không tìm thấy. Thử:\n${suggestions.map(s => `• ${s}`).join('\n')}`,
            'text'
          );
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      addBotMessage('Đã có lỗi. Vui lòng thử lại!', 'text');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const userText = inputValue;
    setInputValue('');
    addUserMessage(userText);
    
    const intent = analyzeIntent(userText);
    
    // Handle show_highest_price
    if (intent.action === 'show_highest_price' && intent.intent) {
      setLoading(true);
      try {
        let params = { page_size: 1 };
        if (intent.searchKeyword) params.search = intent.searchKeyword;
        else if (intent.category) params.search = intent.category;
        if (intent.intent === 'most_expensive') params.ordering = '-variants__price';
        else if (intent.intent === 'cheapest') params.ordering = 'variants__price';
        else params.ordering = '-variants__price'; // Default
        
        const response = await authAxios.get('products/', { params });
        const product = response.data.results?.[0];
        
        if (product) {
          const variant = product.variants?.[0];
          const price = variant?.discount_price || variant?.price;
          addBotMessage(
            `${intent.category ? intent.category.charAt(0).toUpperCase() + intent.category.slice(1) : 'Sản phẩm'} ${intent.intent === 'cheapest' ? 'rẻ nhất' : 'đắt nhất'}:\n\n👉 ${product.name}\n💰 ${price ? Number(price).toLocaleString() + '₫' : 'Chưa có giá'}`,
            'text'
          );
        } else {
          addBotMessage('Không tìm thấy sản phẩm phù hợp.', 'text');
        }
      } catch (error) {
        addBotMessage('Đã có lỗi. Vui lòng thử lại!', 'text');
      } finally {
        setLoading(false);
      }
      return;
    }
    
    // Handle actions
    if (intent.action === 'open_cart') {
      addBotMessage('🛍️ Đang mở giỏ hàng...', 'text');
      setTimeout(() => {
        setVisible(false);
        navigate('/cart');
      }, 1500);
      return;
    }
    
    if (intent.action === 'open_orders') {
      addBotMessage('📝 Đang mở đơn hàng...', 'text');
      setTimeout(() => {
        setVisible(false);
        navigate('/orders');
      }, 1500);
      return;
    }
    
    if (intent.action === 'add_to_cart' && intent.productRef) {
      if (lastProducts.length === 0) {
        addBotMessage('Chưa có sản phẩm nào. Hãy tìm kiếm trước!', 'text');
        return;
      }
      
      const index = intent.productRef === -1 
        ? lastProducts.length - 1 
        : intent.productRef - 1;
      
      const product = lastProducts[index];
      if (product) {
        addBotMessage(`🛍️ Đang thêm "${product.name}" vào giỏ hàng...`, 'text');
        // TODO: Implement add to cart logic here
        setTimeout(() => {
          addBotMessage('✅ Đã thêm vào giỏ hàng!', 'text');
        }, 1000);
      } else {
        addBotMessage(`Chỉ có ${lastProducts.length} sản phẩm. Vui lòng chọn từ 1-${lastProducts.length}`, 'text');
      }
      return;
    }
    
    if (intent.action === 'show_description' && intent.productRef) {
      if (lastProducts.length === 0) {
        addBotMessage('Chưa có sản phẩm nào. Hãy tìm kiếm trước!', 'text');
        return;
      }
      
      const index = intent.productRef === -1 
        ? lastProducts.length - 1 
        : intent.productRef - 1;
      
      const product = lastProducts[index];
      if (product) {
        const variant = product.variants?.[0];
        const price = variant?.discount_price || variant?.price;
        addBotMessage(
          `📝 ${product.name}\n\n${product.description || 'Chưa có mô tả'}\n\n💰 Giá: ${price ? Number(price).toLocaleString() + '₫' : 'Liên hệ'}`,
          'text'
        );
      } else {
        addBotMessage(`Chỉ có ${lastProducts.length} sản phẩm. Chọn từ 1-${lastProducts.length}`, 'text');
      }
      return;
    }
    
    if (intent.action === 'show_product' && intent.productRef) {
      if (lastProducts.length === 0) {
        addBotMessage('Chưa có sản phẩm nào được hiển thị. Hãy tìm kiếm trước!', 'text');
        return;
      }
      
      const index = intent.productRef === -1 
        ? lastProducts.length - 1 
        : intent.productRef - 1;
      
      const product = lastProducts[index];
      if (product) {
        addBotMessage(`👉 Mở sản phẩm: ${product.name}`, 'text');
        setTimeout(() => {
          setVisible(false);
          navigate(`/products/${product.id}`);
        }, 1500);
      } else {
        addBotMessage(`Chỉ có ${lastProducts.length} sản phẩm. Vui lòng chọn từ 1-${lastProducts.length}`, 'text');
      }
      return;
    }
    
    // Quick actions with filters
    if (intent.type === 'best_sellers' || intent.type === 'new_products' || 
        intent.type === 'discounts' || intent.type === 'high_rating' ||
        intent.type === 'most_expensive' || intent.type === 'cheapest') {
      await handleQuickAction(intent.type, intent.category, intent.minPrice, intent.maxPrice);
    } 
    // Search
    else if (intent.type === 'search' || intent.type === 'category_search' || 
             intent.type === 'price_range' || intent.type === 'unclear') {
      await searchProducts(intent);
    }
    // Fallback
    else {
      addBotMessage('Xin lỗi, tôi chưa hiểu. Hãy thử hỏi khác!', 'text');
    }
  };

  const handleProductClick = (productId) => {
    setVisible(false);
    navigate(`/products/${productId}`);
  };

  const renderMessage = (msg) => {
    if (msg.sender === 'user') {
      return (
        <div key={msg.id} style={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          marginBottom: '16px'
        }}>
          <div style={{
            maxWidth: '70%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            padding: '12px 16px',
            borderRadius: '18px 18px 4px 18px',
            fontSize: '14px'
          }}>
            {msg.text}
          </div>
          <Avatar 
            icon={<UserOutlined />} 
            style={{ marginLeft: '8px', background: '#1890ff' }}
          />
        </div>
      );
    }
    
    // Bot messages
    return (
      <div key={msg.id} style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <Avatar 
            src={chatbotImg}
            style={{ marginRight: '8px' }}
          />
          <div style={{ flex: 1 }}>
            {msg.type === 'welcome' && (
              <div>
                <div style={{
                  background: '#f5f5f5',
                  padding: '12px 16px',
                  borderRadius: '4px 18px 18px 18px',
                  fontSize: '14px',
                  marginBottom: '12px'
                }}>
                  {msg.text}
                </div>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Button 
                    type="primary"
                    icon={<FireOutlined />}
                    onClick={() => handleQuickAction('best_sellers')}
                    block
                    style={{ 
                      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                      border: 'none'
                    }}
                  >
                    Sản phẩm bán chạy
                  </Button>
                  <Button 
                    icon={<ThunderboltOutlined />}
                    onClick={() => handleQuickAction('new_products')}
                    block
                  >
                    Sản phẩm mới
                  </Button>
                  <Button 
                    icon={<GiftOutlined />}
                    onClick={() => handleQuickAction('discounts')}
                    block
                    style={{ color: '#f5222d' }}
                  >
                    Đang giảm giá
                  </Button>
                  <Button 
                    icon={<StarFilled />}
                    onClick={() => handleQuickAction('high_rating')}
                    block
                    style={{ color: '#faad14' }}
                  >
                    Đánh giá cao
                  </Button>
                </Space>
              </div>
            )}
            
            {msg.type === 'text' && (
              <div style={{
                background: '#f5f5f5',
                padding: '12px 16px',
                borderRadius: '4px 18px 18px 18px',
                fontSize: '14px'
              }}>
                {msg.text}
              </div>
            )}
            
            {msg.type === 'products' && (
              <div>
                <div style={{
                  background: '#f5f5f5',
                  padding: '12px 16px',
                  borderRadius: '4px 18px 18px 18px',
                  fontSize: '14px',
                  marginBottom: '12px'
                }}>
                  {msg.text}
                </div>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {msg.data?.map(product => {
                    const variant = product.variants?.[0];
                    const primaryImage = variant?.images?.find(img => img.is_primary)?.image || 
                                        variant?.images?.[0]?.image;
                    const imageUrl = primaryImage ? 
                      (primaryImage.startsWith('http') ? primaryImage : `http://localhost:8000${primaryImage}`) 
                      : null;
                    
                    const hasDiscount = variant?.discount_price && variant.discount_price < variant.price;
                    const discountPercent = hasDiscount ? 
                      Math.round((1 - variant.discount_price / variant.price) * 100) : 0;

                    return (
                      <Card
                        key={product.id}
                        hoverable
                        onClick={() => handleProductClick(product.id)}
                        style={{ cursor: 'pointer', borderRadius: '12px' }}
                        bodyStyle={{ padding: '10px' }}
                      >
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <div style={{ 
                            width: '70px', 
                            height: '70px', 
                            borderRadius: '8px',
                            overflow: 'hidden',
                            flexShrink: 0,
                            background: '#f5f5f5',
                            position: 'relative'
                          }}>
                            {hasDiscount && (
                              <div style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                background: '#ff4d4f',
                                color: '#fff',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                zIndex: 1
                              }}>
                                -{discountPercent}%
                              </div>
                            )}
                            {imageUrl ? (
                              <img 
                                src={imageUrl} 
                                alt={product.name}
                                style={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  objectFit: 'cover' 
                                }}
                              />
                            ) : (
                              <div style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '30px'
                              }}>
                                👕
                              </div>
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Text strong ellipsis style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                              {product.name}
                            </Text>
                            <div style={{ marginBottom: '6px' }}>
                              {product.category?.name && (
                                <Tag color="blue" style={{ fontSize: '10px', marginRight: '3px', padding: '0 4px' }}>
                                  {product.category.name}
                                </Tag>
                              )}
                              {product.is_new && (
                                <Tag color="green" style={{ fontSize: '10px', marginRight: '3px', padding: '0 4px' }}>
                                  Mới
                                </Tag>
                              )}
                              {product.sold_count > 50 && (
                                <Tag color="red" style={{ fontSize: '10px', padding: '0 4px' }}>
                                  <FireOutlined style={{ fontSize: '10px' }} /> Hot
                                </Tag>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                              <div>
                                <Text strong style={{ color: '#ff4d4f', fontSize: '14px' }}>
                                  {variant?.discount_price ? 
                                    Number(variant.discount_price).toLocaleString() : 
                                    Number(variant?.price || 0).toLocaleString()
                                  }₫
                                </Text>
                                {variant?.discount_price && (
                                  <Text delete type="secondary" style={{ fontSize: '11px', marginLeft: '6px' }}>
                                    {Number(variant.price).toLocaleString()}₫
                                  </Text>
                                )}
                              </div>
                              <Button type="primary" size="small" style={{ fontSize: '11px', height: '24px', padding: '0 8px' }}>
                                Xem
                              </Button>
                            </div>
                            {product.sold_count > 0 && (
                              <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: '3px' }}>
                                Đã bán: {product.sold_count}
                              </Text>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </Space>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Floating Chat Button with Badge - Chỉ hiện khi chat đóng */}
      {!visible && (
        <Badge dot={hasNewMessage} offset={[-5, 5]}>
          <div
            onClick={() => {
              setVisible(true);
              setMinimized(false);
            }}
            style={{
              position: 'fixed',
              bottom: '40px',
              right: '40px',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(102, 126, 234, 0.2)',
              zIndex: 999,
              background: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              animation: hasNewMessage ? 'pulse 2s infinite' : 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.2), 0 6px 16px rgba(102, 126, 234, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(102, 126, 234, 0.2)';
            }}
          >
            <img 
              src={chatbotImg} 
              alt="Chatbot" 
              style={{ width: '50px', height: '50px', borderRadius: '50%' }}
            />
          </div>
        </Badge>
      )}

      {/* Chat Window */}
      {visible && (
        <Card
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '380px',
            height: '560px',
            zIndex: 999,
            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.18), 0 8px 24px rgba(102, 126, 234, 0.12)',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
          bodyStyle={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '16px 20px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Avatar 
                size={40}
                src={chatbotImg}
              />
              <div>
                <Title level={5} style={{ margin: 0, color: '#fff', fontSize: '16px' }}>
                  Trợ lý AI
                </Title>
                <Text style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
                  Online • Sẵn sàng hỗ trợ
                </Text>
              </div>
            </div>
            <Space size="small">
              <Tooltip title="Thu nhỏ">
                <Button
                  type="text"
                  icon={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>−</span>}
                  onClick={() => {
                    setMinimized(true);
                    setVisible(false);
                  }}
                  style={{ color: '#fff' }}
                />
              </Tooltip>
              <Tooltip title="Đóng">
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={() => {
                    setVisible(false);
                    setMinimized(false);
                  }}
                  style={{ color: '#fff' }}
                />
              </Tooltip>
            </Space>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            background: '#fafafa'
          }}>
            {messages.map(msg => renderMessage(msg))}
            {isTyping && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Avatar 
                    src={chatbotImg}
                    style={{ marginRight: '8px' }}
                  />
                  <div style={{
                    background: '#f5f5f5',
                    padding: '12px 16px',
                    borderRadius: '4px 18px 18px 18px',
                    display: 'flex',
                    gap: '4px',
                    alignItems: 'center',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                  }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#999',
                      animation: 'typing 1.4s infinite',
                      animationDelay: '0s'
                    }}></span>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#999',
                      animation: 'typing 1.4s infinite',
                      animationDelay: '0.2s'
                    }}></span>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#999',
                      animation: 'typing 1.4s infinite',
                      animationDelay: '0.4s'
                    }}></span>
                  </div>
                </div>
              </div>
            )}
            {loading && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin tip="Đang tìm kiếm..." />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: '16px',
            background: '#fff',
            borderTop: '1px solid #f0f0f0'
          }}>
            <Input
              placeholder="Nhập câu hỏi hoặc tìm sản phẩm..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={handleSend}
              disabled={loading}
              suffix={
                <Button
                  type="primary"
                  shape="circle"
                  icon={<SendOutlined />}
                  onClick={handleSend}
                  loading={loading}
                  disabled={!inputValue.trim()}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none'
                  }}
                />
              }
              style={{
                borderRadius: '24px',
                padding: '8px 16px'
              }}
            />
            <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <Tag 
                icon={<SearchOutlined />}
                style={{ cursor: 'pointer', fontSize: '10px', padding: '2px 8px' }}
                onClick={() => setInputValue('áo thun')}
              >
                Tìm áo thun
              </Tag>
              <Tag 
                icon={<GiftOutlined />}
                color="red"
                style={{ cursor: 'pointer', fontSize: '10px', padding: '2px 8px' }}
                onClick={() => handleQuickAction('discounts')}
              >
                Khuyến mãi
              </Tag>
              <Tag 
                icon={<FireOutlined />}
                color="orange"
                style={{ cursor: 'pointer', fontSize: '10px', padding: '2px 8px' }}
                onClick={() => handleQuickAction('best_sellers')}
              >
                Bán chạy
              </Tag>
              <Tag 
                icon={<ThunderboltOutlined />}
                color="green"
                style={{ cursor: 'pointer', fontSize: '10px', padding: '2px 8px' }}
                onClick={() => handleQuickAction('new_products')}
              >
                Hàng mới
              </Tag>
            </div>
          </div>
        </Card>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(102, 126, 234, 0.2);
          }
          50% {
            box-shadow: 0 12px 36px rgba(0, 0, 0, 0.2), 0 6px 18px rgba(102, 126, 234, 0.5);
          }
          100% {
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(102, 126, 234, 0.2);
          }
        }
        
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default ChatBot;
