import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { SelectTrigger } from "@radix-ui/react-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { Link, useLocation, useParams, useNavigate } from "react-router";
import axios from "axios";
import { toast } from "sonner";

//zod schemas
const loginSchema = z.object({
  email: z.string().email("*Invalid email address"),
  password: z.string().min(6, "*Password must be atleast 6 characters"),
});

const signupSchema = z.object({
  email: z.string().email("*Invalid Email Address"),
  password: z.string().min(6, "*Password must be aleast 6 characters"),
  fullName: z.string().min(2, "*Name is too short"),
  profession: z.string({ required_error: "*Please select a profession" }),
  gender: z.enum(["male", "female"], {
    required_error: "*Please select a gender",
  }),
  age: z.coerce.number().int().min(18, "*Not eligible due to age restrictions"),
  terms: z.literal(true, {
    errorMap: () => ({ message: "*You must accept the terms" }),
  }),
});

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState();

  //forms
  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      terms: false,
      age: 18,
    },
  });

  const onLoginSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
        data
      );
      setIsLoading(false);
      toast.success("Login Successful", {
        description: "Welcome back!",
        style: { background: "green", color: "white", border: "none" },
      });
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
      console.log(response.data);
    } catch (error) {
      setIsLoading(false);
      console.log("Error while Login", error.message);
      toast.error("Login Failed", {
        description:
          error.response?.data?.message || "Please check your credentials",
        style: { background: "red", color: "white", border: "none" },
      });
    }
  };

  const onSignupSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/register`,
        data
      );
      setIsLoading(false);
      toast.success("Registration Successful", {
        description: response.data.message,
        style: { background: "green", color: "white", border: "none" },
      });
      // Switch to login tab or let user do it
    } catch (error) {
      setIsLoading(false);
      toast.error("Registration Failed", {
        description: error.response?.data?.message || "Something went wrong",
        style: { background: "red", color: "white", border: "none" },
      });
    }
  };

  return (
    <div className="w-full h-screen lg-grid lg-grid-cols-2">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="mx-auto w-full max-w-[450px]">
          <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome back
            </h1>
          </div>

          {/*tabs*/}
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <Link to="/login" className={isLoading && "pointer-events-none"}>
                <TabsTrigger value="login" className="cursor-pointer w-full">
                  {" "}
                  Login
                </TabsTrigger>
              </Link>
              <Link
                to="/register"
                className={isLoading && "pointer-events-none"}
              >
                <TabsTrigger value="register" className="cursor-pointer w-full">
                  {" "}
                  Create Account
                </TabsTrigger>
              </Link>
            </TabsList>

            {/*login*/}
            <TabsContent value="login">
              <Form {...loginForm}>
                <form
                  className="space-y-4"
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                >
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Email" {...field} />
                        </FormControl>
                        <FormMessage className="text-left" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center">
                          <FormLabel>Password</FormLabel>
                        </div>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter Password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-left" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full cursor-pointer"
                    disabled={isLoading}
                  >
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Login
                  </Button>
                </form>
              </Form>
            </TabsContent>

            {/* signup */}
            <TabsContent value="register">
              <Form {...signupForm}>
                <form
                  className="space-y-4"
                  onSubmit={signupForm.handleSubmit(onSignupSubmit)}
                >
                  <FormField
                    name="fullName"
                    control={signupForm.control}
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormLabel> Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your Name" {...field} />
                          </FormControl>
                          <FormMessage className="text-left" />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    name="email"
                    control={signupForm.control}
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormLabel> Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your Email" {...field} />
                          </FormControl>
                          <FormMessage className="text-left" />
                        </FormItem>
                      );
                    }}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      name="password"
                      control={signupForm.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="enter password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-left" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="gender"
                      control={signupForm.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className=""
                            >
                              <div className="flex items-center gap-5">
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="male" id="m1" />
                                  <Label htmlFor="m1" className="font-normal">
                                    Male
                                  </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="female" id="r2" />
                                  <Label htmlFor="r2" className="font-normal">
                                    Female
                                  </Label>
                                </div>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage className="text-left" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={signupForm.control}
                      name="profession"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profession</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                {/* <SelectValue
                                  className="border-2 bg-muted-foreground"
                                  placeholder="Select"
                                /> */}
                                <Input
                                  type="dropdown"
                                  placeholder="Select"
                                  value={field.value}
                                  className="cursor-pointer"
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Developer">
                                Developer
                              </SelectItem>
                              <SelectItem value="Designer">Designer</SelectItem>
                              <SelectItem value="Manager">Manager</SelectItem>
                              <SelectItem value="HR">HR</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-left" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter age"
                              type="number"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-left" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={signupForm.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start justify-end space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I accept the terms and conditions
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full cursor-pointer"
                    disabled={isLoading}
                  >
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Account
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>

          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <a
              href="#"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>

        <div className="hidden lg:flex flex-col justify-between bg-zinc-900 p-10 text-white dark:border-r">
          <div className="flex items-center text-lg font-medium">
            <div className="mr-2 h-6 w-6 bg-white rounded-full" />
            Our Client
          </div>
          <div className="space-y-6 max-w-lg">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;This Product has saved me countless hours of work and
                helped me manage my employees easily.&rdquo;
              </p>
              <footer className="text-sm">Sofia Davis</footer>
            </blockquote>
          </div>
          <div className="flex items-center space-x-4 text-sm text-zinc-400">
            <span>© 2025 ProU Technology</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
