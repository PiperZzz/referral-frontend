import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Checkbox, Space } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onFinish = async (values: LoginFormData) => {
    setIsSubmitting(true);
    
    const success = await login(values.email, values.password);
    
    if (success) {
      // 登录成功，根据角色跳转到相应页面
      // 这里可以根据用户角色跳转到不同的Dashboard
      navigate('/dashboard');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 品牌Logo和标题 */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <UserOutlined className="text-white text-2xl" />
          </div>
          <Title level={2} className="text-gray-800 mb-2">
            欢迎回来
          </Title>
          <Text className="text-gray-600">
            登录您的推荐系统账号
          </Text>
        </div>

        {/* 登录表单卡片 */}
        <Card 
          className="shadow-elegant-lg border-0 animate-slide-in"
          bodyStyle={{ padding: '32px' }}
        >
          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            autoComplete="off"
            initialValues={{ remember: true }}
          >
            {/* 邮箱 */}
            <Form.Item
              name="email"
              label={<span className="text-gray-700 font-medium">邮箱地址</span>}
              rules={[
                { required: true, message: '请输入邮箱地址' },
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="请输入您的邮箱"
                className="rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500"
              />
            </Form.Item>

            {/* 密码 */}
            <Form.Item
              name="password"
              label={<span className="text-gray-700 font-medium">密码</span>}
              rules={[
                { required: true, message: '请输入密码' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="请输入密码"
                className="rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500"
              />
            </Form.Item>

            {/* 记住我和忘记密码 */}
            <Form.Item className="mb-6">
              <div className="flex justify-between items-center">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox className="text-gray-600">记住我</Checkbox>
                </Form.Item>
                <Link 
                  to="/forgot-password" 
                  className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-200"
                >
                  忘记密码？
                </Link>
              </div>
            </Form.Item>

            {/* 登录按钮 */}
            <Form.Item className="mb-4">
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting || isLoading}
                className="w-full h-12 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 border-0 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
              >
                {isSubmitting ? '登录中...' : '立即登录'}
              </Button>
            </Form.Item>

            {/* 注册链接 */}
            <div className="text-center">
              <Text className="text-gray-600">
                还没有账号？{' '}
                <Link 
                  to="/register" 
                  className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-200"
                >
                  立即注册
                </Link>
              </Text>
            </div>
          </Form>
        </Card>

        {/* 帮助提示 */}
        <div className="text-center mt-6 animate-fade-in">
          <Text className="text-gray-500 text-sm">
            登录遇到问题？{' '}
            <Link to="/help" className="text-blue-500 hover:text-blue-600">联系管理员</Link>
          </Text>
        </div>
      </div>
    </div>
  );
};

export default Login;