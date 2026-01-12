import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PricingPage() {
  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="flex flex-col items-center text-center space-y-4 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Pricing Plans</h1>
        <p className="text-lg text-gray-600 mb-8">
          Choose the plan that&apos;s right for you
        </p>
      </div>

      <Tabs defaultValue="monthly" className="w-full max-w-3xl mx-auto">
        <div className="flex justify-center mb-8">
          <TabsList className="grid w-[400px] grid-cols-2">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="annually">Annually</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="monthly">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
              <CardHeader className="p-6">
                <CardTitle className="text-xl">Basic</CardTitle>
                <CardDescription>For individual learners</CardDescription>
                <div className="mt-4 flex items-baseline text-slate-800 dark:text-slate-50">
                  <span className="text-4xl font-bold">$9.99</span>
                  <span className="ml-1 text-sm font-medium text-slate-600 dark:text-slate-400">/month</span>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <ul className="space-y-2 text-sm">
                  {["Access to 50+ courses", "Basic course materials", "Community forum access", "Email support"].map(
                    (feature) => (
                      <li key={feature} className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        <span className="text-slate-600 dark:text-slate-400">{feature}</span>
                      </li>
                    ),
                  )}
                </ul>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white">Get Started</Button>
              </CardFooter>
            </Card>
            <Card className="border-slate-800 bg-slate-800 text-white dark:border-slate-50 dark:bg-slate-50 dark:text-slate-900">
              <CardHeader className="p-6">
                <div className="inline-block rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-800 dark:bg-slate-900 dark:text-white">
                  Popular
                </div>
                <CardTitle className="mt-4 text-xl">Pro</CardTitle>
                <CardDescription className="text-slate-300 dark:text-slate-600">For serious learners</CardDescription>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold">$19.99</span>
                  <span className="ml-1 text-sm font-medium text-slate-300 dark:text-slate-600">/month</span>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <ul className="space-y-2 text-sm">
                  {[
                    "Access to all courses",
                    "Advanced course materials",
                    "Community forum access",
                    "Priority email support",
                    "1 mentor session per month",
                    "Course completion certificates",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-green-400" />
                      <span className="text-slate-300 dark:text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button className="w-full bg-white text-slate-800 hover:bg-slate-100 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800">
                  Get Started
                </Button>
              </CardFooter>
            </Card>
            <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
              <CardHeader className="p-6">
                <CardTitle className="text-xl">Enterprise</CardTitle>
                <CardDescription>For teams and organizations</CardDescription>
                <div className="mt-4 flex items-baseline text-slate-800 dark:text-slate-50">
                  <span className="text-4xl font-bold">$49.99</span>
                  <span className="ml-1 text-sm font-medium text-slate-600 dark:text-slate-400">/month</span>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <ul className="space-y-2 text-sm">
                  {[
                    "Access to all courses",
                    "Premium course materials",
                    "Community forum access",
                    "24/7 priority support",
                    "Unlimited mentor sessions",
                    "Course completion certificates",
                    "Custom learning paths",
                    "Team analytics dashboard",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      <span className="text-slate-600 dark:text-slate-400">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white">Contact Sales</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="annually">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
              <CardHeader className="p-6">
                <CardTitle className="text-xl">Basic</CardTitle>
                <CardDescription>For individual learners</CardDescription>
                <div className="mt-4 flex items-baseline text-slate-800 dark:text-slate-50">
                  <span className="text-4xl font-bold">$7.99</span>
                  <span className="ml-1 text-sm font-medium text-slate-600 dark:text-slate-400">/month</span>
                </div>
                <p className="mt-1 text-xs text-green-500">Save $24 annually</p>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <ul className="space-y-2 text-sm">
                  {["Access to 50+ courses", "Basic course materials", "Community forum access", "Email support"].map(
                    (feature) => (
                      <li key={feature} className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        <span className="text-slate-600 dark:text-slate-400">{feature}</span>
                      </li>
                    ),
                  )}
                </ul>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white">Get Started</Button>
              </CardFooter>
            </Card>
            <Card className="border-slate-800 bg-slate-800 text-white dark:border-slate-50 dark:bg-slate-50 dark:text-slate-900">
              <CardHeader className="p-6">
                <div className="inline-block rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-800 dark:bg-slate-900 dark:text-white">
                  Popular
                </div>
                <CardTitle className="mt-4 text-xl">Pro</CardTitle>
                <CardDescription className="text-slate-300 dark:text-slate-600">For serious learners</CardDescription>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold">$15.99</span>
                  <span className="ml-1 text-sm font-medium text-slate-300 dark:text-slate-600">/month</span>
                </div>
                <p className="mt-1 text-xs text-green-400">Save $48 annually</p>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <ul className="space-y-2 text-sm">
                  {[
                    "Access to all courses",
                    "Advanced course materials",
                    "Community forum access",
                    "Priority email support",
                    "1 mentor session per month",
                    "Course completion certificates",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-green-400" />
                      <span className="text-slate-300 dark:text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button className="w-full bg-white text-slate-800 hover:bg-slate-100 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800">
                  Get Started
                </Button>
              </CardFooter>
            </Card>
            <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
              <CardHeader className="p-6">
                <CardTitle className="text-xl">Enterprise</CardTitle>
                <CardDescription>For teams and organizations</CardDescription>
                <div className="mt-4 flex items-baseline text-slate-800 dark:text-slate-50">
                  <span className="text-4xl font-bold">$39.99</span>
                  <span className="ml-1 text-sm font-medium text-slate-600 dark:text-slate-400">/month</span>
                </div>
                <p className="mt-1 text-xs text-green-500">Save $120 annually</p>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <ul className="space-y-2 text-sm">
                  {[
                    "Access to all courses",
                    "Premium course materials",
                    "Community forum access",
                    "24/7 priority support",
                    "Unlimited mentor sessions",
                    "Course completion certificates",
                    "Custom learning paths",
                    "Team analytics dashboard",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      <span className="text-slate-600 dark:text-slate-400">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white">Contact Sales</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-16 border-t border-slate-200 pt-8 dark:border-slate-800">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-50 text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {[
            {
              question: "What payment methods do you accept?",
              answer:
                "We accept all major credit cards, PayPal, and bank transfers for annual plans. All payments are securely processed.",
            },
            {
              question: "Can I cancel my subscription?",
              answer:
                "Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.",
            },
            {
              question: "Do you offer refunds?",
              answer:
                "We offer a 14-day money-back guarantee for all our plans. If you&apos;re not satisfied, contact our support team.",
            },
            {
              question: "Can I switch between plans?",
              answer: "Yes, you can upgrade or downgrade your plan at any time. The price difference will be prorated.",
            },
            {
              question: "Do you offer discounts for students?",
              answer:
                "Yes, we offer a 20% discount for students with a valid student ID. Contact our support team to apply.",
            },
            {
              question: "How do mentor sessions work?",
              answer:
                "Mentor sessions are 1-on-1 video calls with industry experts. You can book them through your dashboard.",
            },
          ].map((faq, i) => (
            <div
              key={i}
              className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950"
            >
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-50">{faq.question}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
