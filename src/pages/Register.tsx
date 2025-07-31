import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, WechatOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  wechatId?: string;
  referrerWechatId?: string;
}

const Register: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onFinish = async (values: RegisterFormData) => {
    setIsSubmitting(true);
    
    const success = await register({
      email: values.email,
      password: values.password,
      wechatId: values.wechatId,
      referrerWechatId: values.referrerWechatId,
    });

    if (success) {
      // 注册成功，跳转到登录页
      setTimeout(() => {
        navigate('/login');
      }, 2000);
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
            创建账号
          </Title>
          <Text className="text-gray-600">
            加入我们的推荐系统，开始您的推荐之旅
          </Text>
        </div>

        {/* 注册表单卡片 */}
        <Card 
          className="shadow-elegant-lg border-0 animate-slide-in"
          bodyStyle={{ padding: '32px' }}
        >
          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            autoComplete="off"
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
                { min: 6, message: '密码长度不能少于6位' },
                { max: 20, message: '密码长度不能超过20位' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="请输入密码（6-20位）"
                className="rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500"
              />
            </Form.Item>

            {/* 确认密码 */}
            <Form.Item
              name="confirmPassword"
              label={<span className="text-gray-700 font-medium">确认密码</span>}
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="请再次输入密码"
                className="rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500"
              />
            </Form.Item>

            <Divider className="my-6">
              <span className="text-gray-500 text-sm">可选信息</span>
            </Divider>

            {/* 微信号 */}
            <Form.Item
              name="wechatId"
              label={<span className="text-gray-700 font-medium">微信号</span>}
            >
              <Input
                prefix={<WechatOutlined className="text-gray-400" />}
                placeholder="请输入您的微信号（可选）"
                className="rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500"
              />
            </Form.Item>

            {/* 推荐人微信号 */}
            <Form.Item
              name="referrerWechatId"
              label={<span className="text-gray-700 font-medium">推荐人微信号</span>}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="请输入推荐人微信号（可选）"
                className="rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500"
              />
            </Form.Item>

            {/* 提交按钮 */}
            <Form.Item className="mb-4">
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting || isLoading}
                className="w-full h-12 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 border-0 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
              >
                {isSubmitting ? '注册中...' : '立即注册'}
              </Button>
            </Form.Item>

            {/* 登录链接 */}
            <div className="text-center">
              <Text className="text-gray-600">
                已有账号？{' '}
                <Link 
                  to="/login" 
                  className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-200"
                >
                  立即登录
                </Link>
              </Text>
            </div>
          </Form>
        </Card>

        {/* 帮助提示 */}
        <div className="text-center mt-6 animate-fade-in">
          <Text className="text-gray-500 text-sm">
            注册即表示您同意我们的{' '}
            <a href="#" className="text-blue-500 hover:text-blue-600">服务条款</a>
            {' '}和{' '}
            <a href="#" className="text-blue-500 hover:text-blue-600">隐私政策</a>
          </Text>
        </div>
      </div>
    </div>
  );
};

export default Register;