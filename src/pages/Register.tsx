import React, { useState } from 'react';
import { Form, Input, Button, Typography, Space, message, Modal } from 'antd';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  wechatId?: string;
  referrerWechatId?: string;
}

const Register: React.FC = () => {
  const [form] = Form.useForm();
  const { register, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const onFinish = async (values: RegisterFormData) => {
    setIsSubmitting(true);
    
    try {
      const { confirmPassword, ...registerData } = values;
      const success = await register(registerData);
      
      if (success) {
        setIsModalVisible(true);
        form.resetFields();
      }
    } catch (error) {
      console.error('Register error:', error);
      message.error('Registration process failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      {/* Top right navigation */}
      <div className="absolute top-6 right-6">
        <Space size={16}>
          <Link 
            to="/login"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Login
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
      <div className="w-full max-w-md mx-auto">
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

        {/* Register Form - Following the screenshot style */}
        <div className="border-2 border-gray-800 p-8" style={{ borderRadius: 0 }}>
          <div className="border-b-2 border-gray-800 pb-2 mb-6">
            <Title level={4} className="mb-0 text-gray-900 font-normal">
              Sign up
            </Title>
          </div>

          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            layout="vertical"
            autoComplete="off"
            className="space-y-4"
          >
            {/* Email Field - Required */}
            <Form.Item
              name="email"
              label={
                <span className="text-sm text-gray-700 font-normal">
                  Email
                </span>
              }
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
              className="mb-4"
            >
              <Input
                placeholder=""
                className="h-10 border-gray-800 rounded-none border-2 focus:border-gray-800 hover:border-gray-800"
                style={{
                  borderRadius: 0,
                  boxShadow: 'none',
                }}
              />
            </Form.Item>

            {/* Password Field - Required */}
            <Form.Item
              name="password"
              label={
                <span className="text-sm text-gray-700 font-normal">
                  Password
                </span>
              }
              rules={[
                { required: true, message: 'Please enter your password' },
                { min: 6, message: 'Password must be at least 6 characters' },
              ]}
              className="mb-4"
            >
              <Input.Password
                placeholder=""
                className="h-10 border-gray-800 rounded-none border-2 focus:border-gray-800 hover:border-gray-800"
                style={{
                  borderRadius: 0,
                  boxShadow: 'none',
                }}
              />
            </Form.Item>

            {/* Confirm Password Field - Required */}
            <Form.Item
              name="confirmPassword"
              label={
                <span className="text-sm text-gray-700 font-normal">
                  Confirm Password
                </span>
              }
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
              className="mb-4"
            >
              <Input.Password
                placeholder=""
                className="h-10 border-gray-800 rounded-none border-2 focus:border-gray-800 hover:border-gray-800"
                style={{
                  borderRadius: 0,
                  boxShadow: 'none',
                }}
              />
            </Form.Item>

            {/* WeChat Field - Optional */}
            <Form.Item
              name="wechatId"
              label={
                <span className="text-sm text-gray-700 font-normal">
                  WeChat
                </span>
              }
              className="mb-4"
            >
              <Input
                placeholder=""
                className="h-10 border-gray-800 rounded-none border-2 focus:border-gray-800 hover:border-gray-800"
                style={{
                  borderRadius: 0,
                  boxShadow: 'none',
                }}
              />
            </Form.Item>

            {/* Phone Number Field - Optional */}
            <Form.Item
              name="phoneNumber"
              label={
                <span className="text-sm text-gray-700 font-normal">
                  Phone number
                </span>
              }
              className="mb-6"
            >
              <Input
                placeholder=""
                className="h-10 border-gray-800 rounded-none border-2 focus:border-gray-800 hover:border-gray-800"
                style={{
                  borderRadius: 0,
                  boxShadow: 'none',
                }}
              />
            </Form.Item>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                type="default"
                htmlType="submit"
                loading={isSubmitting || isLoading}
                className="h-10 px-6 border-2 border-gray-800 rounded-none bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-800"
                style={{
                  borderRadius: 0,
                  fontWeight: 'normal',
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
              
              <Link to="/login">
                <Button
                  type="default"
                  className="h-10 px-6 border-2 border-gray-800 rounded-none bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-800"
                  style={{
                    borderRadius: 0,
                    fontWeight: 'normal',
                  }}
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </Form>
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        title="Registration Successful"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Link key="login" to="/login">
            <Button 
              type="default"
              onClick={handleModalClose}
              className="h-10 px-6 border-2 border-gray-300 rounded-none bg-white text-gray-700 hover:bg-gray-50"
              style={{ borderRadius: 0 }}
            >
              Login
            </Button>
          </Link>
        ]}
        centered
      >
        <div className="py-4">
          <p className="text-gray-700 mb-4">
            Your account has been created successfully.
          </p>
          <p className="text-gray-600 text-sm">
            Please wait for an administrator to activate your account. You will receive an email notification once your account is activated.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default Register;