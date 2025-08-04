import React, { useState } from 'react';
import { Form, Input, Button, Typography, Space, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onFinish = async (values: LoginFormData) => {
    setIsSubmitting(true);
    
    try {
      const success = await login(values.email, values.password);
      
      if (success) {
        // Login successful, routing is handled by AuthContext and role-based redirect
        const primaryRole = localStorage.getItem('primaryRole');
        
        switch (primaryRole) {
          case 'MASTER':
            navigate('/master/dashboard');
            break;
          case 'ADMIN':
            navigate('/admin/dashboard');
            break;
          case 'USER':
          default:
            navigate('/user/profile');
            break;
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error('Login process failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      {/* Top right navigation */}
      <div className="absolute top-6 right-6">
        <Space size={16}>
          <Link 
            to="/register"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Signup
          </Link>
          <Link 
            to="/help"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Help
          </Link>
        </Space>
      </div>

      {/* Main content */}
      <div className="w-full max-w-sm mx-auto">
        {/* Title */}
        <div className="text-center mb-12">
          <Title 
            level={1} 
            className="text-4xl font-normal text-gray-900 mb-0"
            style={{ fontWeight: 400, fontSize: '2.5rem', marginBottom: 0 }}
          >
            MOYI Referral
          </Title>
        </div>

        {/* Login Form */}
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          autoComplete="off"
          className="space-y-6"
        >
          {/* Email Field (Changed from Username) */}
          <Form.Item
            name="email"
            label={
              <span className="text-sm text-gray-700 font-normal">
                Email:
              </span>
            }
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
            className="mb-6"
          >
            <Input
              placeholder=""
              className="h-12 border-gray-300 rounded-none border-2 focus:border-gray-400 hover:border-gray-400"
              style={{
                borderRadius: 0,
                boxShadow: 'none',
              }}
            />
          </Form.Item>

          {/* Password Field */}
          <Form.Item
            name="password"
            label={
              <span className="text-sm text-gray-700 font-normal">
                Password:
              </span>
            }
            rules={[
              { required: true, message: 'Please enter your password' },
            ]}
            className="mb-8"
          >
            <Input.Password
              placeholder=""
              className="h-12 border-gray-300 rounded-none border-2 focus:border-gray-400 hover:border-gray-400"
              style={{
                borderRadius: 0,
                boxShadow: 'none',
              }}
            />
          </Form.Item>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button
              type="default"
              htmlType="submit"
              loading={isSubmitting || isLoading}
              className="h-12 px-8 border-2 border-gray-300 rounded-none bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400"
              style={{
                borderRadius: 0,
                fontWeight: 'normal',
              }}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
            
            <Link to="/forget-password">
              <Button
                type="default"
                className="h-12 px-8 border-2 border-gray-300 rounded-none bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                style={{
                  borderRadius: 0,
                  fontWeight: 'normal',
                }}
              >
                Forget Password
              </Button>
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Login;